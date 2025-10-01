import prisma from '~~/lib/prisma';
import z from 'zod';
import { rankService } from '~~/server/trpc/services/rank';

const JudgeCompleteSchema = z.object({
   token: z.uuid('Invalid token format'),
   recordId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, {
         message: 'recordId must be a positive integer',
      }),
});

export default defineEventHandler(async (event) => {
   const query = getQuery(event);
   const parseResult = JudgeCompleteSchema.safeParse(query);
   if (!parseResult.success) {
      throw createError({
         statusCode: 400,
         message: 'Invalid request: ' + parseResult.error.message,
      });
   }

   const { token, recordId } = parseResult.data;
   const redis = useRedis();

   const storedToken = await redis.get(`judge_token:${recordId}`);
   if (storedToken !== token) {
      throw createError({
         statusCode: 403,
         message: 'Invalid token',
      });
   }
   await redis.del(`judge_token:${recordId}`);

   const { problemId, score, result } =
      await prisma.judgeRecords.findUniqueOrThrow({
         where: { id: recordId },
         select: { problemId: true, score: true, result: true },
      });
   if (result === 'success') {
      await rankService.pushToRankings(problemId, recordId, score);
   }

   return { message: 'ok' };
});
