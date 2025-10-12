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

export const achievementRouter = router({
   getCurrentCheckinAchievement: getCurrentCheckinAchievementProcedure,
});
