import z from 'zod';

export const CreateTaskSchema = z.object({
   judgeRecordId: z.int().min(1, 'Judge Record ID must be a positive integer'),
   userId: z
      .string('User ID must be a string')
      .nonempty('User ID cannot be empty'),
   judgeScript: z.string().nonempty('Judge script cannot be empty'),
   fsSnapshot: z.record(z.string(), z.string()),
   mode: z.enum(['audit', 'judge']),
});
