import prisma from '~~/lib/prisma';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';
import { dailyService } from '../../services/daily';

function hasDailyCheckin(userId: string, date: Date) {
   return prisma.dailyCheckin.findFirst({
      where: { userId, date },
   });
}

const hasCheckedinProcedure = protectedProcedure.query(async ({ ctx }) => {
   const { userId } = ctx.user;
   const today = dayjs().startOf('day').toDate();
   const checkin = await hasDailyCheckin(userId, today);
   return !!checkin;
});

const hasCompletedDailyProblemProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;

      const dailyProblem = await prisma.dailyProblem.findFirst({
         orderBy: { id: 'desc' },
         select: { baseProblemId: true },
      });
      if (!dailyProblem) {
         return false;
      }

      const record = await prisma.judgeRecords.findFirst({
         where: {
            userId,
            problem: {
               baseId: dailyProblem.baseProblemId,
            },
            result: 'success',
            type: 'judge',
         },
      });
      return !!record;
   }
);

const dailyCheckinProcedure = protectedProcedure.mutation(async ({ ctx }) => {
   const { userId } = ctx.user;
   const today = dayjs().startOf('day').toDate();

   const hasCheckin = await hasDailyCheckin(userId, today);
   if (hasCheckin) {
      throw new TRPCError({
         code: 'BAD_REQUEST',
         message: 'Already checked in today',
      });
   }

   const { baseProblemId: dailyProblemId } =
      await prisma.dailyProblem.findFirstOrThrow({
         orderBy: { id: 'desc' },
         select: { baseProblemId: true },
      });
   const existingCompleteRecord = await prisma.judgeRecords.findFirst({
      where: {
         userId,
         result: 'success',
         type: 'judge',
         problem: {
            baseId: dailyProblemId,
         },
      },
   });
   if (!existingCompleteRecord) {
      throw new TRPCError({
         code: 'BAD_REQUEST',
         message: 'Please complete the daily challenge before checking in',
      });
   }

   const redis = useRedis();
   const cacheKey = `daily:continues-checkin-count:${userId}`;
   const countCache = await redis.get(cacheKey);
   const count = cacheKey
      ? Number(countCache)
      : await dailyService.countContinuesCheckin(userId);

   await Promise.all([
      redis.set(cacheKey, (count + 1).toString(), 'EX', 24 * 60 * 60),
      prisma.dailyCheckin.create({
         data: { userId, date: today },
      }),
   ]);

   return { success: true };
});

const continuesCheckinCountProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;

      const redis = useRedis();
      const cacheKey = `daily:continues-checkin-count:${userId}`;
      const cachedCount = await redis.get(cacheKey);
      if (cachedCount) {
         return parseInt(cachedCount, 10);
      }

      const count = await dailyService.countContinuesCheckin(userId);

      // 缓存到 0 点
      const tomorrow = dayjs().add(1, 'day').startOf('day');
      await redis.set(
         cacheKey,
         count.toString(),
         'EX',
         tomorrow.diff(dayjs(), 'second')
      );

      return count;
   }
);

export const dailyRouter = router({
   checkin: dailyCheckinProcedure,
   hasCheckedin: hasCheckedinProcedure,
   hasCompletedDailyProblem: hasCompletedDailyProblemProcedure,
   continuesCheckinCount: continuesCheckinCountProcedure,
});
