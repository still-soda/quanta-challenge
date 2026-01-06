import prisma from '~~/lib/prisma';
import { publicProcedure, router } from '../../trpc';
import { z } from 'zod';

const GetSubmissionStatusSchema = z.object({
   username: z.string(),
});

const getSubmissionStatus = publicProcedure
   .input(GetSubmissionStatusSchema)
   .query(async ({ input }) => {
      const { username } = input;

      const { id: userId } = await prisma.user.findUniqueOrThrow({
         where: { name: username },
         select: {
            id: true,
         },
      });

      // 检查用户空间配置是否公开提交状态
      const userSpaceConfig = await prisma.userSpaceConfig.findUnique({
         where: { userId },
         select: { showSubmissionStatus: true },
      });

      // 如果用户不存在或未公开提交状态，返回 null
      if (!userSpaceConfig || !userSpaceConfig.showSubmissionStatus) {
         return null;
      }

      // 检查 Redis 缓存
      const redis = useRedis();
      const cacheKey = `public:submission-status:${userId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
         return JSON.parse(cached);
      }

      // 查询提交状态
      const submissions = await prisma.judgeRecords.findMany({
         where: { userId, type: 'judge' },
         select: { createdAt: true },
      });

      const statusCount: Record<string, number> = {};
      submissions.forEach((submission) => {
         const date = submission.createdAt.toISOString().split('T')[0];
         if (!statusCount[date]) {
            statusCount[date] = 0;
         }
         statusCount[date]++;
      });

      // 缓存 5 分钟 (300 秒)
      await redis.set(cacheKey, JSON.stringify(statusCount), 'EX', 300);

      return statusCount;
   });

const getAchievements = publicProcedure
   .input(z.object({ username: z.string() }))
   .query(async ({ input }) => {
      const { username } = input;

      const { id: userId } = await prisma.user.findUniqueOrThrow({
         where: { name: username },
         select: {
            id: true,
         },
      });

      // 检查用户空间配置是否公开成就
      const userSpaceConfig = await prisma.userSpaceConfig.findUnique({
         where: { userId },
         select: { showAchievements: true },
      });

      // 如果用户不存在或未公开成就，返回 null
      if (!userSpaceConfig || !userSpaceConfig.showAchievements) {
         return null;
      }

      // 检查 Redis 缓存
      const redis = useRedis();
      const cacheKey = `public:achievements:${userId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
         return JSON.parse(cached);
      }

      // 查询已获得的成就
      const achievements = await prisma.userAchievement.findMany({
         where: {
            userId,
            progress: 1,
         },
         select: {
            achievement: {
               select: {
                  id: true,
                  name: true,
                  badgeImage: {
                     select: {
                        name: true,
                     },
                  },
               },
            },
            achievedAt: true,
         },
         orderBy: {
            achievedAt: 'desc',
         },
      });

      const result = achievements.map((ach) => ({
         id: ach.achievement.id,
         name: ach.achievement.name,
         badgeUrl: `/api/static/${ach.achievement.badgeImage.name}`,
         achievedAt: ach.achievedAt,
      }));

      // 缓存 5 分钟 (300 秒)
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

      return result;
   });

export const dashboardRouter = router({
   getSubmissionStatus,
   getAchievements,
});
