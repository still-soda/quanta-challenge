import { EventType, type ITaskCompletedPayload } from '../events/index.js';
import { EventEmitterService } from '../utils/event-emitter.js';
import { url } from '@challenge/shared/utils';
import prisma from '../utils/prisma.js';

const requestWebhook = async (data: {
   judgeRecordId: number;
   token: string;
}) => {
   const { judgeRecordId, token } = data;
   const appServerUrl = process.env.APP_SERVER_URL || 'http://localhost:3000';

   const callbackUrl = url(appServerUrl, '/api/webhooks/judge-complete', {
      token,
      recordId: judgeRecordId,
   });

   return fetch(callbackUrl).catch((e) =>
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

   EventEmitterService.instance.on<ITaskCompletedPayload>(
      EventType.TASK_COMPLETED,
      async ({ job, result }) => {
         console.log(`Task completed for job ${job.id}:`, result);
         const status =
            result.type === 'error'
               ? 'invalid'
               : result.status === 'completed'
               ? 'ready'
               : 'invalid';
         await setStatus(job.data.judgeRecordId, status, job.data.mode);
         requestWebhook(job.data);
      }
   );

   EventEmitterService.instance.on(
      EventType.TASK_FAILED,
      async ({ job, error }) => {
         console.error(`Task failed for job ${job.id}:`, error);
         await setStatus(job.data.judgeRecordId, 'invalid', job.data.mode);
         requestWebhook(job.data);
      }
   );

   EventEmitterService.instance.on(
      EventType.TASK_ERROR,
      async ({ job, error }) => {
         console.error(`Task error for job ${job.id}:`, error);
         await setStatus(job.data.judgeRecordId, 'invalid', job.data.mode);
         requestWebhook(job.data);
      }
   );
};
