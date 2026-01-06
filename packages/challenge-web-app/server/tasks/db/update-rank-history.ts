import dayjs from 'dayjs';
import { logger } from '~~/lib/logger';
import prisma from '~~/lib/prisma';
import { rankService } from '../../trpc/services/rank';

export default defineTask({
   meta: {
      name: 'db:update-rank-history',
      description: 'Update rank history from Redis to database',
   },
   run: async () => {
      logger.info('[Job:UpdateRankHistory] Starting job...');
      const redis = useRedis();
      const jobKey = 'job:update-rank-history';

      const success = await redis.setnx(jobKey, 'running');
      if (!success) {
         logger.warn(
            '[Job:UpdateRankHistory] Another instance is running, skip this execution.'
         );
         return { result: [] };
      }

      const data: { userId: string; score: number; rank: number }[] = [];

      try {
         const rankingKey = 'global:rankings';

         const existRanking = await redis.exists(rankingKey);
         if (!existRanking) {
            logger.info(
               '[Job:UpdateRankHistory] Global rankings not exist, loading...'
            );
            await rankService.loadGlobalRankings();
         }

         const userScores = await redis.zrange(rankingKey, 0, -1, 'WITHSCORES');
         for (let i = 0; i < userScores.length; i += 2) {
            data.push({
               userId: userScores[i],
               score: parseInt(userScores[i + 1]),
               rank: i / 2 + 1,
            });
         }

         const date = dayjs().startOf('day').toDate();
         await prisma.$transaction(async (tx) => {
            await tx.rankingHistory.deleteMany({
               where: { date },
            });
            await tx.rankingHistory.createMany({
               data: data.map(({ userId, score, rank }) => ({
                  userId,
                  score,
                  rank,
                  date,
               })),
               skipDuplicates: true,
            });
         });
      } catch (error) {
         logger.error(
            '[Job:UpdateRankHistory] Failed to update rank history.',
            error
         );
         logger.log('Data: ', JSON.stringify(data));
         return { result: [] };
      } finally {
         await redis.del(jobKey);
      }

      return { result: data };
   },
});
