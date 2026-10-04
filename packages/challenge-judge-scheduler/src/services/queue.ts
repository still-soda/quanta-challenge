import { Queue, Worker, type Processor } from 'bullmq';
import { Singleton } from '../utils/singleton';
import { RedisService } from './redis';
import { EventEmitterService } from '../utils/event-emitter';
import { EventType } from '../events/index';

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
      const queue = this.queues.get(name) ?? new Queue(name, { connection: this.redis });
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
            console.log(`[INFO] Job ${job.id} completed successfully.`);
            EventEmitterService.instance.emit(EventType.TASK_COMPLETED, {
               job,
               result,
            });
         });

         worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed with error: ${err?.message}`);
            EventEmitterService.instance.emit(EventType.TASK_FAILED, {
               job,
               // 字段名必须与 result-handler 的解构一致。
               // 原实现这里发的是 err，而监听方解构的是 error，导致错误详情永远是 undefined。
               error: err,
            });
         });

         worker.on('error', (err) => {
            // 注意：BullMQ 的 'error' 事件**不携带 job**（例如 Redis ECONNRESET 时会触发）。
            // 因此这里不能假设有 job；监听方必须做空值保护，否则 job.id 会抛 TypeError
            // 并直接让整个调度器进程退出。
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
