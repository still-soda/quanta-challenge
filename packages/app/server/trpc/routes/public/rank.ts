import prisma from '~~/lib/prisma';
import { rankService } from '../../services/rank';
import { publicProcedure, router } from '../../trpc';

interface GlobalRankingWithUserInfo {
   rank: number;
   score: number;
   userName: string;
   avatarUrl: string | null;
   correctRate: number;
   passCount: number;
   totalScore: number;
   userId: string;
}

const getGlobalRankingsProcedure = publicProcedure.query<
   GlobalRankingWithUserInfo[]
>(async () => {
   const redis = useRedis();
   const cacheKey = 'global:rankings:with-userinfo';

   const cached = await redis.get(cacheKey);
   if (cached) {
      return JSON.parse(cached);
   }

   const rankings = await rankService.getGlobalRankings(100);
   const userIds = rankings.map((r) => r.userId);

   const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
         id: true,
         name: true,
         avatar: {
            select: { name: true },
         },
         UserStatistic: {
            select: {
               correctRate: true,
               passCount: true,
               score: true,
            },
         },
      },
   });
   const userMap = new Map(users.map((u) => [u.id, u]));

   const result = rankings.map((r, idx) => {
      const user = userMap.get(r.userId);
      return {
         rank: idx + 1,
         score: r.score,
         userName: user?.name || '匿名用户',
         userId: user?.id || 'unknown',
         avatarUrl: user?.avatar?.name
            ? `/api/static/${user?.avatar?.name}`
            : null,
         correctRate: user?.UserStatistic?.correctRate || 0,
         passCount: user?.UserStatistic?.passCount || 0,
         totalScore: user?.UserStatistic?.score || 0,
      };
   });

   const globalCacheTTL = useRuntimeConfig().rank.globalCacheTTL;
   await redis.set(cacheKey, JSON.stringify(result), 'EX', globalCacheTTL);

   return result;
});

export const rankRouter = router({
   getGlobalRankings: getGlobalRankingsProcedure,
});
