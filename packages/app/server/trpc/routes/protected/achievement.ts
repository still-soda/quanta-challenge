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

const getAllAchievementsProcedure = protectedProcedure.query(async () => {
   const achievements = await prisma.achievement.findMany({
      select: {
         id: true,
         name: true,
         description: true,
         badgeImage: {
            select: {
               name: true,
            },
         },
      },
      orderBy: {
         id: 'asc',
      },
   });

   return achievements.map((ach) => ({
      id: ach.id,
      name: ach.name,
      description: ach.description,
      badgeUrl: `/api/static/${ach.badgeImage.name}`,
   }));
});

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

const getUserAchievementsWallProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;
      const achievements = await prisma.achievement.findMany({
         select: {
            id: true,
            name: true,
            description: true,
            badgeImage: {
               select: {
                  name: true,
               },
            },
            UserAchievement: {
               where: { userId },
               select: {
                  progress: true,
                  achievedAt: true,
               },
            },
            AchievementPreAchievement: {
               select: {
                  preAchievementId: true,
               },
            },
         },
         orderBy: {
            id: 'asc',
         },
      });

      type Achievement = (typeof achievements)[number];
      const achievementMap = new Map<number, Achievement>();
      achievements.forEach((ach) => {
         achievementMap.set(ach.id, ach);
      });

      const achievementList = achievements.map((ach) => ({
         id: ach.id,
         name: ach.name,
         description: ach.description,
         badgeUrl: `/api/static/${ach.badgeImage.name}`,
         progress: ach.UserAchievement[0]?.progress || 0,
         achievedAt: ach.UserAchievement[0]?.achievedAt || null,
         preAchievementIds: ach.AchievementPreAchievement.map(
            (pre) => pre.preAchievementId
         ),
      }));

      const dto = (ach: (typeof achievementList)[number]) => ({
         id: ach.id,
         name: ach.name,
         description: ach.description,
         badgeUrl: ach.badgeUrl,
         progress: ach.progress,
         achievedAt: ach.progress >= 1 ? ach.achievedAt : null,
      });

      const achieved = achievementList
         .filter((ach) => ach.progress >= 1)
         .map(dto);

      const achievedIdsSet = new Set(achieved.map((ach) => ach.id));
      const locked = achievementList
         .filter((ach) =>
            ach.preAchievementIds.some((id) => !achievedIdsSet.has(id))
         )
         .map(dto);

      const lockedIdsSet = new Set(locked.map((ach) => ach.id));
      const inProgress = achievementList
         .filter(
            (ach) =>
               ach.progress >= 0 &&
               ach.progress < 1 &&
               !lockedIdsSet.has(ach.id)
         )
         .map(dto);

      return {
         achieved,
         inProgress,
         locked,
      };
   }
);

export const achievementRouter = router({
   getCurrentCheckinAchievement: getCurrentCheckinAchievementProcedure,
   getAchievedAchievements: getAchievedAchievementsProcedure,
   getAllAchievements: getAllAchievementsProcedure,
   getUserAchievementsWall: getUserAchievementsWallProcedure,
});
