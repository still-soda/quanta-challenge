import { EventType, type ITaskCompletedPayload } from '../events/index.js';
import { EventEmitterService } from '../utils/event-emitter.js';
import prisma from '../utils/prisma.js';

export const initTaskResultHandlers = () => {
   const appServerUrl = process.env.APP_SERVER_URL || 'http://localhost:3000';

   const setStatus = async (
      judgeRecordId: number,
      status: 'ready' | 'invalid'
   ) => {
      const { problemId } = await prisma.judgeRecords.findUniqueOrThrow({
         where: {
            id: judgeRecordId,
         },
         select: { problemId: true },
      });
      await prisma.problems.update({
         where: {
            pid: problemId,
         },
         data: { status },
      });
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
         await setStatus(job.data.judgeRecordId, status);
      }
   );

   EventEmitterService.instance.on(
      EventType.TASK_FAILED,
      async ({ job, error }) => {
         console.error(`Task failed for job ${job.id}:`, error);
         await setStatus(job.data.judgeRecordId, 'invalid');
      }
   );

   EventEmitterService.instance.on(
      EventType.TASK_ERROR,
      async ({ job, error }) => {
         console.error(`Task error for job ${job.id}:`, error);
         await setStatus(job.data.judgeRecordId, 'invalid');
      }
   );
};
