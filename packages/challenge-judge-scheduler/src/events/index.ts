import type { JudgeResultSchema } from '@challenge/judge-machine/schemas';
import type { JobSchema } from '../schemas/job.js';
import type z from 'zod';
import type { Job } from 'bullmq';

export enum EventType {
   JUDGE_FINISHED = 'judge_finished',
   TASK_COMPLETED = 'task_completed',
   TASK_FAILED = 'task_failed',
   TASK_ERROR = 'task_error',
}

export type JobType = z.infer<typeof JobSchema>;
export type JudgeResultType = z.infer<typeof JudgeResultSchema>;
export type ProcessResultType = {
   judgeRecordId: string;
   jobId: string;
   message: string;
   status: 'completed' | 'failed';
};

export interface ITaskCompletedPayload {
   job: Job<JobType>;
   result: JudgeResultType;
}

export interface ITaskFailedPayload {
   job: Job<JobType>;
   err: Error;
}

export interface ITaskErrorPayload {
   err: Error;
}
