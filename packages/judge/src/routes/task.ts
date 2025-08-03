import { Hono } from 'hono';
import { CreateTaskSchema } from '../schemas/create-task.js';
import { QueueService } from '../services/queue.js';
import { judgeProcessor } from '../services/judge-processor.js';
import type z from 'zod';
import { JobSchema } from '../schemas/job.js';
import { zValidator } from '../utils/validator.js';

QueueService.instance.initWorkers('judge-task', judgeProcessor, 3);

const taskRoute = new Hono();

taskRoute.post('/create', zValidator('json', CreateTaskSchema), async (c) => {
   const payload = c.req.valid('json');

   type Job = z.infer<typeof JobSchema>;
   const data: Job = {
      ...payload,
      queueTimestamp: Date.now(),
   };
   const job = await QueueService.instance
      .getQueue<Job>('judge-task')
      .add('judge-task', data, {
         attempts: 3,
         backoff: {
            type: 'exponential',
            delay: 1000,
         },
      });

   return c.json(
      {
         message: `Task created and queued successfully`,
         jobId: job!.id,
      },
      201
   );
});

export default taskRoute;
