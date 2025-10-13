import prisma from '~~/lib/prisma';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';

const getCurrentCheckinAchievementProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;

      const achievement = await prisma.achievement.findFirst({
         where: {
            CheckinAchievement: {
               isNot: null,
            },
            UserAchievement: {
               none: { userId, progress: 1 },
            },
         },
         orderBy: {
            id: 'asc',
         },
         select: {
            name: true,
            description: true,
            badgeImage: {
               select: {
                  name: true,
               },
            },
            UserAchievement: {
               where: { userId },
               select: { progress: true },
            },
         },
      });

      return {
         badgeUrl: `/api/static/${achievement?.badgeImage.name}`,
         name: achievement?.name,
         description: achievement?.description,
         progress: achievement?.UserAchievement[0]?.progress || 0,
      };
   }
);

const getAchievedAchievementsProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;

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

      return achievements.map((ach) => ({
         id: ach.achievement.id,
         name: ach.achievement.name,
         badgeUrl: `/api/static/${ach.achievement.badgeImage.name}`,
         achievedAt: ach.achievedAt,
      }));
   }
);

export const achievementRouter = router({
   getCurrentCheckinAchievement: getCurrentCheckinAchievementProcedure,
   getAchievedAchievements: getAchievedAchievementsProcedure,
});
