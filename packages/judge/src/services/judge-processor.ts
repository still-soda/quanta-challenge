import type { Processor } from 'bullmq';
import type z from 'zod';
import prisma from '../utils/prisma.js';
import type { JobSchema } from '../schemas/job.js';

type Job = z.infer<typeof JobSchema>;

export const judgeProcessor: Processor<Job> = async (job) => {
   console.log('Processing job:', job);

   const pendingTime = Date.now() - job.data.queueTimestamp;

   return await prisma.judgeRecord.update({
      where: {
         id: job.data.judgeRecordId,
      },
      data: {
         pendingTime: pendingTime,
         result: 'success',
      },
   });
};
