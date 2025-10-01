import prisma from '@challenge/database';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';

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
      const today = dayjs().startOf('day').toDate();

      const dailyProblem = await prisma.dailyProblem.findFirst({
         where: { date: today },
         select: { problemId: true },
      });
      if (!dailyProblem) {
         return false;
      }

      const record = await prisma.judgeRecords.findFirst({
         where: {
            userId,
            problemId: dailyProblem.problemId,
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

   const { problemId: dailyProblemId } =
      await prisma.dailyProblem.findFirstOrThrow({
         where: { date: today },
         select: { problemId: true },
      });
   const existingCompleteRecord = await prisma.judgeRecords.findFirst({
      where: {
         userId,
         result: 'success',
         type: 'judge',
         problemId: dailyProblemId,
      },
   });
   if (!existingCompleteRecord) {
      throw new TRPCError({
         code: 'BAD_REQUEST',
         message: 'Please complete the daily challenge before checking in',
      });
   }

   await prisma.dailyCheckin.create({
      data: { userId, date: today },
   });
   return { success: true };
});

const continuesCheckinCountProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;
      const month = dayjs().startOf('month');
      let count = 0;

      const checkins = await prisma.dailyCheckin.findMany({
         where: {
            userId,
            date: { gte: month.toDate() },
         },
         orderBy: { date: 'desc' },
      });

      for (let i = 0; i < checkins.length; i++) {
         const checkinDate = dayjs(checkins[i].date);
         if (i === 0) {
            if (checkinDate.isSame(dayjs(), 'day')) {
               count++;
            } else if (checkinDate.isSame(dayjs().subtract(1, 'day'), 'day')) {
               count++;
            } else {
               break;
            }
         } else {
            const prevCheckinDate = dayjs(checkins[i - 1].date);
            if (checkinDate.isSame(prevCheckinDate.subtract(1, 'day'), 'day')) {
               count++;
            } else {
               break;
            }
         }
      }

      return count;
   }
);

export const dailyRouter = router({
   checkin: dailyCheckinProcedure,
   hasCheckedin: hasCheckedinProcedure,
   hasCompletedDailyProblem: hasCompletedDailyProblemProcedure,
   continuesCheckinCount: continuesCheckinCountProcedure,
});
