import { EventType, type ITaskCompletedPayload } from '../events/index';
import { EventEmitterService } from '../utils/event-emitter';
import { url } from '@challenge/shared/utils';
import prisma from '../utils/prisma';
import { generateOpenApiSign } from '@challenge/shared/openapi';

const requestWebhook = async (data: { judgeRecordId: number }) => {
   const { judgeRecordId } = data;
   const appServerUrl = process.env.APP_SERVER_URL || 'http://localhost:3000';

   const params = { recordId: judgeRecordId.toString() };
   const path = '/api/webhooks/judge-complete';
   const timestamp = Date.now();

   const sign = generateOpenApiSign({
      secret: process.env.OPENAPI_WEBHOOK_SECRET || 'default_secret',
      timestamp,
      params,
      path,
   });
   const cookie = `webhook_timestamp=${timestamp}; sign=${sign};`;

   const callbackUrl = url(appServerUrl, path, params);

   return fetch(callbackUrl, { headers: { Cookie: cookie } }).catch((e) =>
      console.error('💀 Error sending callback:', e)
   );
};

export const initTaskResultHandlers = () => {
   const setStatus = async (
      judgeRecordId: number,
      status: 'ready' | 'invalid',
      mode: 'judge' | 'audit'
   ) => {
      const { problemId } = await prisma.judgeRecords.findUniqueOrThrow({
         where: {
            id: judgeRecordId,
         },
         select: { problemId: true },
      });
      if (mode === 'audit') {
         await prisma.problems.update({
            where: {
               pid: problemId,
            },
            data: { status },
         });
      }
   };

   /**
    * 这些 async 监听器由 EventEmitterService.emit 直接调用，**没有任何地方 await 其返回值**，
    * 因此一旦内部抛出/拒绝，就会变成 unhandledRejection 并终止整个调度器进程。
    * 判题过程中任何一次数据库抖动或 Redis 抖动都会命中这里，所以统一包一层兜底。
    */
   const safeHandler =
      (name: string, fn: (payload: any) => Promise<void>) =>
      (payload: any) => {
         Promise.resolve(fn(payload)).catch((e) =>
            console.error(`[ERROR] ${name} 处理失败（已忽略，不影响进程）:`, e),
         );
      };

   EventEmitterService.instance.on<ITaskCompletedPayload>(
      EventType.TASK_COMPLETED,
      safeHandler('TASK_COMPLETED', async ({ job, result }) => {
         if (!job?.data) {
            console.error('[WARN] TASK_COMPLETED 缺少 job，已忽略:', result);
            return;
         }
         console.log(`[INFO] Task completed for job ${job.id}:`, result);
         const status =
            result.type === 'error'
               ? 'invalid'
               : result.status === 'completed'
               ? 'ready'
               : 'invalid';
         await setStatus(job.data.judgeRecordId, status, job.data.mode);
         requestWebhook(job.data);
      })
   );

   EventEmitterService.instance.on(
      EventType.TASK_FAILED,
      safeHandler('TASK_FAILED', async ({ job, error }: { job?: any; error?: any }) => {
         // 空值保护：worker 的 'error' 事件不带 job，若直接访问 job.id 会抛 TypeError
         // 并让整个调度器进程退出（这正是之前"判题判着判着服务就没了"的原因）。
         console.error(`Task failed for job ${job?.id ?? '<unknown>'}:`, error);
         if (!job?.data) return;
         await setStatus(job.data.judgeRecordId, 'invalid', job.data.mode);
         requestWebhook(job.data);
      })
   );

   EventEmitterService.instance.on(
      EventType.TASK_ERROR,
      safeHandler(
         'TASK_ERROR',
         async ({ job, error, err }: { job?: any; error?: any; err?: any }) => {
            // 该类事件可能只带 err（BullMQ 'error'，例如 Redis ECONNRESET），没有 job。
            // 这类是基础设施瞬时故障，不应终止进程，也不该改动任何判题记录状态。
            const detail = error ?? err;
            if (!job?.data) {
               console.error(
                  '[WARN] 判题 worker 报错（无关联任务，可能是 Redis/队列瞬时故障，已忽略）:',
                  detail?.message ?? detail,
               );
               return;
            }
            console.error(`Task error for job ${job.id}:`, detail);
            await setStatus(job.data.judgeRecordId, 'invalid', job.data.mode);
            requestWebhook(job.data);
         },
      )
   );
};
