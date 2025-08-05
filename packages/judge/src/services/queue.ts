import { Queue, Worker, type Processor } from 'bullmq';
import { Singleton } from '../utils/singleton.js';
import { RedisService } from './redis.js';
import { EventEmitterService } from '../utils/event-emitter.js';
import { EventType } from '../events/index.js';

export class QueueService extends Singleton {
   static get instance() {
      return this.getInstance<QueueService>();
   }

   private constructor(
      public readonly redis = RedisService.instance,
      public readonly workers: Worker[] = [],
      public readonly queues = new Map<string, Queue>()
   ) {
      super();
   }

   getQueue<T>(name: string) {
      const queue = this.queues.get(name) ?? new Queue(name);
      this.queues.set(name, queue);
      return queue as Queue<T>;
   }

   initWorkers(
      name: string,
      processor: Processor,
      options?: {
         count?: number;
      }
   ) {
      const { count = 1 } = options ?? {};
      const workers = new Array(count).fill(0).map(() => {
         const worker = new Worker(name, processor, { connection: this.redis });

         worker.on('completed', (job, result) => {
            console.log(`Job ${job.id} completed successfully.`);
            EventEmitterService.instance.emit(EventType.TASK_COMPLETED, {
               job,
               result,
            });
         });

         worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed with error: ${err.message}`);
            EventEmitterService.instance.emit(EventType.TASK_FAILED, {
               job,
               err,
            });
         });

         worker.on('error', (err) => {
            console.error('Worker encountered an error:', err);
            EventEmitterService.instance.emit(EventType.TASK_ERROR, { err });
         });

         return worker;
      });

      this.workers.push(...workers);

      return workers;
   }

   destroy() {
      this.workers.forEach((worker) => {
         worker.close().catch((err) => {
            console.error('Error closing worker:', err);
         });
      });
   }
}
