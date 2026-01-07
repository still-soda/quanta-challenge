import { Job } from 'bullmq';
import { JobType } from '../../events/index';

export type JudgeJob = Job<JobType>;
