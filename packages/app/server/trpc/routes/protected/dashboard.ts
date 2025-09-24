import prisma from '@challenge/database';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import { rankService } from '../../services/rank';

const getRecentSubmissions = protectedProcedure.query(async ({ ctx }) => {
   const { userId } = ctx.user;

   const recentRecord = await prisma.judgeRecords.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
         id: true,
         result: true,
         judgingTime: true,
         pendingTime: true,
         score: true,
         problem: {
            select: {
               pid: true,
               title: true,
               JudgeStatus: {
                  select: {
                     passedCount: true,
                     totalCount: true,
                  },
               },
            },
         },
      },
   });
   if (!recentRecord) {
      return null;
   }

   const [recordId, problemId] = [recentRecord.id, recentRecord.problem.pid];
   const rank = await rankService.getSelfRank(problemId, recordId);

   const passedCount = recentRecord.problem.JudgeStatus?.passedCount || 0;
   const totalCount = recentRecord.problem.JudgeStatus?.totalCount || 0;
   const passRate = totalCount === 0 ? 0 : passedCount / totalCount;

   return {
      judgingTime: recentRecord.judgingTime,
      pendingTime: recentRecord.pendingTime,
      score: recentRecord.score,
      result: recentRecord.result,
      title: recentRecord.problem.title,
      passRate: passRate,
      aheadRate: rank.aheadRate,
      recordId: recordId,
      problemId: problemId,
   };
});

const getSubmissionStatus = protectedProcedure.query(async ({ ctx }) => {
   const { userId } = ctx.user;

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

   return statusCount;
});

export const dashboardRouter = router({
   getRecentSubmissions,
   getSubmissionStatus,
});
