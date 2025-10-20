import prisma, { tracker } from '~~/lib/prisma';
import { AchievementObserver } from './utils/achievement-observer';
import { requestContext } from '../context';
import { logger } from '../../../lib/logger';

export const observer = new AchievementObserver(() => {
   const ctx = requestContext.getStore();
   const userId = ctx?.userId;
   return userId ?? null;
});

observer.observe(tracker);

observer.useVarsInjector(async () => {
   const ctx = requestContext.getStore();
   const userId = ctx?.userId;

   const redis = useRedis();
   const cacheKey = `daily:continues-checkin-count:${userId}`;
   const cache = await redis.get(cacheKey);
   const continuesCheckinCount = Number(cache ?? '0');

   return { userId, continuesCheckinCount };
});

observer.addListener('check', async (achId, result, userId) => {
   if (!userId) {
      return;
   }
   const progress = result.achieved ? 1 : Math.min(result.progress, 1);
   await prisma.userAchievement
      .upsert({
         where: {
            userId_achievementId: { achievementId: achId, userId },
         },
         create: {
            progress: progress,
            achievement: { connect: { id: achId } },
            user: { connect: { id: userId } },
         },
         update: {
            progress: progress,
            achievedAt: new Date(),
         },
      })
      .catch((err) => {
         logger.error('[Observer:check] Error awarding achievement:', err);
      });
});

/**
 * 使用 DFS 双色标法检测成就前置依赖中是否存在环
 */
const hasCircularDependency = async (
   achievementId: number,
   preAchievementIds: number[]
) => {
   const achievements = await prisma.achievementPreAchievement.findMany({
      select: {
         achievementId: true,
         preAchievementId: true,
      },
   });
   const graph: Record<number, number[]> = {};

   achievements.forEach(({ achievementId, preAchievementId }) => {
      if (!graph[achievementId]) {
         graph[achievementId] = [];
      }
      graph[achievementId].push(preAchievementId);
   });

   if (!graph[achievementId]) {
      graph[achievementId] = [];
   }
   graph[achievementId].push(...preAchievementIds);

   const visited = new Set<number>();
   const recStack = new Set<number>();

   const dfs = (node: number): boolean => {
      if (!visited.has(node)) {
         visited.add(node);
         recStack.add(node);

         const neighbors = graph[node] || [];
         for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && dfs(neighbor)) {
               return true;
            } else if (recStack.has(neighbor)) {
               return true;
            }
         }
      }
      recStack.delete(node);
      return false;
   };

   return dfs(achievementId);
};

export const achievementService = {
   get observer() {
      return observer;
   },
   hasCircularDependency,
};
