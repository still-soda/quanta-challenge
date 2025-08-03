import { Queue, Worker, type Processor } from 'bullmq';
import { Singleton } from '../utils/singleton.js';
import { RedisService } from './redis.js';

export class QueueService extends Singleton {
   static get instance() {
      return this.getInstance<QueueService>();
   }

   private constructor(public readonly redis = RedisService.instance) {
      super();
   }

   workers: Worker[] = [];
   queues = new Map<string, Queue>();

   getQueue<T>(name: string) {
      const queue = this.queues.get(name) ?? new Queue(name);
      this.queues.set(name, queue);
      return queue as Queue<T>;
   }

   initWorkers(name: string, processor: Processor, count = 1) {
      const workers = new Array(count).fill(0).map(() => {
         const worker = new Worker(name, processor, { connection: this.redis });

         worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed successfully.`);
         });

         worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed with error: ${err.message}`);
         });

         worker.on('error', (err) => {
            console.error('Worker encountered an error:', err);
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
