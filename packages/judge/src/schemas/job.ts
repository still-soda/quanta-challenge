import z from 'zod';
import { CreateTaskSchema } from './create-task.js';

export const JobSchema = CreateTaskSchema.extend({
   queueTimestamp: z.number().int('Queue time must be a integer'),
});
