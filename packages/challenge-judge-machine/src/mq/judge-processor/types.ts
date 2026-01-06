import { Job } from 'bullmq';
import { JobType } from '../../events/index.js';

export type JudgeJob = Job<JobType>;
