import type { Job, Processor } from 'bullmq';
import type { JobType, JudgeResultType } from '../../events/index.js';
import type z from 'zod';
import { DockerService } from '../../services/docker.js';
import type { TaskSchema } from '@challenge/judge-machine/schemas';
import { EventEmitterService } from '../../utils/event-emitter.js';
import { EventType } from '../../events/index.js';
import type { IStoreService } from '../../utils/store.js';
import path from 'path';
import { LocalStoreService } from '../../utils/local-store.js';
import { delay } from '../../utils/wait.js';
import * as db from './db.js';
import { JudgeJob } from './types.js';

const sendTaskToJudgeMachine = async (options: {
   job: JudgeJob;
   networkUrl: string;
}) => {
   const { job, networkUrl } = options;

   type TaskType = z.infer<typeof TaskSchema>;
   DockerService.instance.judgeMachineWs!.send(
      JSON.stringify({
         judgeRecordId: job.data.judgeRecordId,
         judgeScript: job.data.judgeScript,
         mode: job.data.mode,
         url: networkUrl,
      } satisfies TaskType)
   );

   const reuslt = await new Promise<JudgeResultType>((resolve, reject) => {
      const off = () => {
         EventEmitterService.instance.off(
            EventType.JUDGE_FINISHED,
            judgeFinished
         );
      };
      const judgeFinished = async (payload: JudgeResultType) => {
         if (payload.judgeRecordId !== job.data.judgeRecordId) return;
         off();
         clearTimeout(timer);
         resolve(payload);
      };
      EventEmitterService.instance.on<JudgeResultType>(
         EventType.JUDGE_FINISHED,
         judgeFinished
      );
      const timer = setTimeout(() => {
         off();
         reject(new Error('Judge Machine response timeout'));
      }, 30 * 1000); // 超时处理
   });

   return reuslt;
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

   if (result.type === 'error') {
      throw new Error(result.message || 'Unknown error from Judge Machine');
   }

   // 获取问题 ID 和问题总分
   const { problemId, score } = await db.getProblemInfoByRecordId(
      job.data.judgeRecordId
   );

   // 储存首屏截图
   if (job.data.mode === 'audit' && result.firstScreen) {
      const { firstScreen } = result;
      await db.saveFirstScreen({ store, firstScreen, problemId });
   }

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
   await db.createShadowFiles({ job, storedBufferRecords });

   // 将结果中的文件 buffer 替换为存储的 URL，更新数据库记录
   await db.saveSuccessRecord({
      result,
      pendingTime,
      startTime,
      job,
      storedBufferRecords,
   });

   // 返回是否通过审核
   const allPass = result.results.every((item) => item.status === 'pass');
   return job.data.mode === 'audit'
      ? allPass && result.totalScore === score
      : allPass;
};

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

      // 发送任务到 Judge Machine，等待返回结果
      const result = await sendTaskToJudgeMachine({ job, networkUrl });

      // 处理 Judge Machine 返回的结果
      const pass = await processResult(
         { result, pendingTime, startTime, job },
         LocalStoreService.instance
      );

      // 关闭 Live Server 容器
      close();

      return {
         judgeRecordId: job.data.judgeRecordId,
         jobId: job.id,
         status: pass ? 'completed' : 'failed',
         message: 'Judge task processed successfully',
      };
   } catch (error: any) {
      // 处理错误
      await db.saveErrorRecord({ error, pendingTime, startTime, job });
      cleanup && cleanup();

      return {
         judgeRecordId: job.data.judgeRecordId,
         jobId: job.id,
         status: 'failed',
         message: error.message || 'Unknown error occurred',
      };
   }
};
