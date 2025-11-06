import prisma from '~~/lib/prisma';
import z from 'zod';
import { rankService } from '~~/server/trpc/services/rank';
import { observer } from '~~/server/trpc/services/achievement';
import { ValidPath } from '~~/lib/track-wrapper';
import { logger } from '~~/lib/logger';

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
      FROM judge_records
      JOIN problems 
        ON judge_records."problemId" = problems.pid
      WHERE problems."baseId" = ${baseId}
        AND result = 'success'
   `;
   if (highestScore.length === 0 || highestScore[0].max === null) {
      return -1;
   }
   return highestScore[0].max - score;
};

const updateUserStatistic = async (
   userId: String,
   scoreIncreatment: number
) => {
   await prisma.$executeRaw`
      WITH stats AS (
         SELECT 
            COUNT(DISTINCT "problemId") 
               FILTER (WHERE result = 'success') 
               AS pass_problems_count,
            COUNT(*) 
               FILTER (WHERE result = 'success') 
               AS pass_count,
            COUNT(*) 
               AS total_count
         FROM judge_records
         WHERE type = 'judge'
           AND "userId" = ${userId}
      )
      INSERT INTO user_statistics ("userId", "correctRate", "passCount", score, "createdAt", "updatedAt")
      SELECT 
         ${userId},
         CASE 
            WHEN stats.total_count = 0 THEN 0
            ELSE ROUND((stats.pass_count::decimal / stats.total_count) * 100, 2)
         END,
         stats.pass_problems_count,
         ${scoreIncreatment},
         NOW(),
         NOW()
      FROM stats
      ON CONFLICT ("userId") 
      DO UPDATE SET 
         "correctRate" = CASE 
            WHEN (SELECT COUNT(*) FROM judge_records WHERE type = 'judge' AND "userId" = ${userId}) = 0 THEN 0
            ELSE ROUND(
               (SELECT COUNT(*) FILTER (WHERE result = 'success')::decimal 
                FROM judge_records 
                WHERE type = 'judge' AND "userId" = ${userId}) 
               / 
               (SELECT COUNT(*)::decimal 
                FROM judge_records 
                WHERE type = 'judge' AND "userId" = ${userId}) 
               * 100, 2
            )
         END,
         "passCount" = (
            SELECT COUNT(DISTINCT "problemId") 
            FROM judge_records 
            WHERE type = 'judge' 
              AND "userId" = ${userId} 
              AND result = 'success'
         ),
         "updatedAt" = NOW(),
         score = user_statistics.score + ${scoreIncreatment};
   `;

   const affectedFields = [
      'user_statistics.correctRate',
      'user_statistics.passCount',
      scoreIncreatment > 0 ? 'user_statistics.score' : null,
   ].filter(Boolean);
   observer.manualMarkDirty(affectedFields as ValidPath[]);
};

export default defineEventHandler(async (event) => {
   const query = getQuery(event);
   const parseResult = JudgeCompleteSchema.safeParse(query);
   if (!parseResult.success) {
      logger.error('Judge complete failed: ' + parseResult.error.message, {
         query,
      });
      throw createError({
         statusCode: 400,
         message: 'Invalid request: ' + parseResult.error.message,
      });
   }

   const { token, recordId } = parseResult.data;
   const redis = useRedis();

   const storedToken = await redis.get(`judge_token:${recordId}`);
   if (storedToken !== token) {
      logger.error('Judge complete failed: Invalid token', { recordId, token });
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

   let scoreDiff = 0;
   if (result === 'success') {
      await rankService.pushToProblemRankings(problem.pid, recordId, score);
      scoreDiff = await calculateScoreDiff(problem.baseId, score);
      if (scoreDiff > 0) {
         await rankService.udpateGlobalRanking(userId, scoreDiff);
      }
   }
   await updateUserStatistic(userId, Math.max(scoreDiff, 0));

   logger.info('Judge complete success', {
      recordId,
      userId,
      problemId: problem.pid,
      score,
      result,
   });

   return { message: 'ok' };
});
