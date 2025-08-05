import { EventType, type ITaskCompletedPayload } from '../events/index.js';
import { EventEmitterService } from '../utils/event-emitter.js';

export const initTaskResultHandlers = () => {
   const appServerUrl = process.env.APP_SERVER_URL || 'http://localhost:3000';

   EventEmitterService.instance.on<ITaskCompletedPayload>(
      EventType.TASK_COMPLETED,
      ({ job, result }) => {
         console.log(`Task completed for job ${job.id}:`, result);
      }
   );

   EventEmitterService.instance.on(EventType.TASK_FAILED, ({ job, error }) => {
      console.error(`Task failed for job ${job.id}:`, error);
   });

   EventEmitterService.instance.on(EventType.TASK_ERROR, ({ job, error }) => {
      console.error(`Task error for job ${job.id}:`, error);
   });
};
