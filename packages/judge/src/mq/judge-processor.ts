import type { Job, Processor } from 'bullmq';
import type { JobType, JudgeResultType } from '../events/index.js';
import type z from 'zod';
import prisma from '../utils/prisma.js';
import { DockerService } from '../services/docker.js';
import type { TaskSchema } from '@challenge/judge-machine/schemas';
import { EventEmitterService } from '../utils/event-emitter.js';
import { EventType } from '../events/index.js';
import type { IStoreService } from '../utils/store.js';
import path from 'path';
import { LocalStoreService } from '../utils/local-store.js';
import { delay } from '../utils/wait.js';

export const judgeProcessor: Processor<JobType> = async (job) => {
   const pendingTime = Date.now() - job.data.queueTimestamp;
   const startTime = Date.now();
   let cleanup;

   try {
      if (!DockerService.instance.judgeMachineWs) {
         throw new Error('Judge machine WebSocket is not connected');
      }

      // 启动 Live Server 容器
      const { networkUrl, close } =
         await DockerService.instance.startLiveServerContainer(
            job.data.fsSnapshot
         );
      cleanup = close;

      // 等待容器启动稳定
      await delay(1000);

      // 发送任务到 Judge Machine
      type TaskType = z.infer<typeof TaskSchema>;
      DockerService.instance.judgeMachineWs.send(
         JSON.stringify({
            judgeRecordId: job.data.judgeRecordId,
            judgeScript: job.data.judgeScript,
            mode: job.data.mode,
            url: networkUrl,
         } satisfies TaskType)
      );

      // 等待 Judge Machine 返回结果
      const result = await new Promise<JudgeResultType>((resolve, reject) => {
         EventEmitterService.instance.on<JudgeResultType>(
            EventType.JUDGE_FINISHED,
            async (payload) => {
               if (payload.judgeRecordId !== job.data.judgeRecordId) return;
               resolve(payload);
               clearTimeout(timer);
            }
         );
         const timer = setTimeout(() => {
            reject(new Error('Judge Machine response timeout'));
         }, 30 * 1000); // 超时处理
      });

      // 处理 Judge Machine 返回的结果，关闭容器
      await processResult(
         { result, pendingTime, startTime, job },
         LocalStoreService.instance
      );

      // 关闭 Live Server 容器
      close();

      return {
         judgeRecordId: job.data.judgeRecordId,
         jobId: job.id,
         status: 'completed',
         message: 'Judge task processed successfully',
      };
   } catch (error: any) {
      console.error('Error processing job:', error);
      // 处理错误
      await handleError({ error, pendingTime, startTime, job });
      cleanup?.();

      return {
         judgeRecordId: job.data.judgeRecordId,
         jobId: job.id,
         status: 'failed',
         message: error.message || 'Unknown error occurred',
      };
   }
};

const processResult = async (
   options: {
      result: JudgeResultType;
      pendingTime: number;
      startTime: number;
      job: Job<JobType>;
   },
   store: IStoreService
) => {
   const { result, pendingTime, startTime, job } = options;

   if (result.type === 'done') {
      // 扁平化产生的文件记录
      const bufferRecords = result.results
         .map((item) => item.cacheFiles)
         .reduce((acc, curr) => ({ ...acc, ...curr }), {});

      // 保存文件到本地存储
      const storedBufferRecords: Record<string, string> = {};
      await Promise.all(
         Object.entries(bufferRecords).map(async ([fileName, buffer]) => {
            const fileId = await store.save(buffer, fileName);
            storedBufferRecords[fileName] = fileId + path.extname(fileName);
         })
      );

      // 创建影子文件
      await prisma.$transaction(async (tx) => {
         const images = Object.entries(storedBufferRecords).map(
            ([_, name]) => ({
               id: name.split('.').shift(),
               name,
            })
         );

         await tx.image.createMany({
            data: images,
         });

         await tx.shadowFile.createMany({
            data: images.map((image) => ({
               judgeRecordId: job.data.judgeRecordId,
               type: 'image',
               imageId: image.id,
            })),
         });
      });

      // 将结果中的文件 buffer 替换为存储的 URL
      const savedResult = result.results.map((item) => ({
         ...item,
         cacheFiles: Object.keys(item.cacheFiles).reduce(
            (acc, key) => ({
               ...acc,
               [key]: storedBufferRecords[key] || '',
            }),
            {} as Record<string, string>
         ),
      }));

      // 更新数据库记录
      await prisma.judgeRecord.update({
         where: { id: job.data.judgeRecordId },
         data: {
            pendingTime,
            judgingTime: Date.now() - startTime,
            info: savedResult,
            result: result.status === 'pass' ? 'success' : 'failed',
            score: result.totalScore,
         },
      });
   } else {
      console.log({
         pendingTime,
         judgingTime: Date.now() - startTime,
         info: {
            errorMessage: result.message,
         },
         result: 'failed',
      });
      // 处理错误结果
      await prisma.judgeRecord.update({
         where: { id: job.data.judgeRecordId },
         data: {
            pendingTime,
            judgingTime: Date.now() - startTime,
            info: {
               errorMessage: result.message,
            },
            result: 'failed',
         },
      });
   }
};

const handleError = async (options: {
   error: Error;
   pendingTime: number;
   startTime: number;
   job: Job<JobType>;
}) => {
   await prisma.judgeRecord.update({
      where: { id: options.job.data.judgeRecordId },
      data: {
         pendingTime: options.pendingTime,
         judgingTime: Date.now() - options.startTime,
         result: 'failed',
         info: {
            errorMessage: options.error.message,
         },
      },
   });
};
