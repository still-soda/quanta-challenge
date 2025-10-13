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

const calculateScoreDiff = async (baseId: number, score: number) => {
   const highestScore = await prisma.$queryRaw<{ max: number }[]>`
      SELECT MAX(score) AS max
      FROM "JudgeRecords" 
      WHERE "problemBaseId" = ${baseId} 
        AND result = 'success'
   `;
   if (highestScore.length === 0 || highestScore[0].max === null) {
      return -1;
   }
   return highestScore[0].max - score;
};

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

   const { problem, score, result, userId } =
      await prisma.judgeRecords.findUniqueOrThrow({
         where: { id: recordId },
         select: {
            problem: {
               select: {
                  pid: true,
                  baseId: true,
               },
            },
            userId: true,
            score: true,
            result: true,
         },
      });
   if (result === 'success') {
      await rankService.pushToProblemRankings(problem.pid, recordId, score);
      const scoreDiff = await calculateScoreDiff(problem.baseId, score);
      if (scoreDiff > 0) {
         await rankService.udpateGlobalRanking(userId, scoreDiff);
      }
   }

   return { message: 'ok' };
});
