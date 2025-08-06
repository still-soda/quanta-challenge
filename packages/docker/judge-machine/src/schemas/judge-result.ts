import z from 'zod';

export const JudgeSuccessResultSchema = z.object({
   type: z.literal('done'),
   message: z.string(),
   judgeTime: z.number(),
   totalScore: z.number(),
   maxScore: z.number(),
   status: z.enum(['completed', 'fail']),
   judgeRecordId: z.number(),
   firstScreen: z.instanceof(Buffer).optional(),
   results: z.array(
      z.object({
         score: z.number(),
         totalScore: z.number(),
         details: z.string(),
         status: z.enum(['pass', 'fail']),
         cacheFiles: z.record(z.string(), z.instanceof(Buffer)),
      })
   ),
});

export const JudgeErrorResultSchema = z.object({
   type: z.literal('error'),
   message: z.string(),
   judgeRecordId: z.number().optional(),
   judgeTime: z.number(),
});

export const JudgeResultSchema = z.discriminatedUnion('type', [
   JudgeSuccessResultSchema,
   JudgeErrorResultSchema,
]);
