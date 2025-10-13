import z from 'zod';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import prisma from '~~/lib/prisma';
import { rankService } from '../../services/rank';

const GetMyRankInProblemSchema = z.object({
   recordId: z.number('Record ID must be a number'),
});

const getMyRankInProblemProcedure = protectedProcedure
   .input(GetMyRankInProblemSchema)
   .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const { recordId } = input;

      // 确保存在有得分的提交记录
      const { problemId } = await prisma.judgeRecords.findUniqueOrThrow({
         where: {
            id: recordId,
            userId,
            score: { gt: 0 },
         },
         select: {
            problemId: true,
         },
      });

      return await rankService.getSelfProblemRanking(problemId, recordId);
   });

const GetProblemScoreIntervalsSchema = z.object({
   problemId: z.number('Problem ID must be a number'),
});

const getProblemScoreIntervalsProcedure = protectedProcedure
   .input(GetProblemScoreIntervalsSchema)
   .query(async ({ input }) => {
      const { problemId } = input;
      return await rankService.getProblemRankingIntervals(problemId, 16);
   });

const getMyGlobalRankStatisticProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;

      const [selfRanking, rankingIntervals] = await Promise.all([
         rankService.getSelfGlobalRanking(userId),
         rankService.getGlobalRankingIntervals(8),
      ]);

      return {
         selfRanking,
         rankingIntervals,
      };
   }
);

const getMyRankingTrendsProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;

      const history = await prisma.rankingHistory.findMany({
         where: { userId },
         orderBy: { date: 'asc' },
         select: {
            rank: true,
         },
         take: 6,
      });

      let rankings: number[] = [];
      if (history.length < 6) {
         const fillCount = 6 - history.length;
         const fillValue = history[0]?.rank ?? 0;
         rankings = Array(fillCount)
            .fill(fillValue)
            .concat(history.map((h) => h.rank));
      } else {
         rankings = history.slice(-6).map((h) => h.rank);
      }

      return rankings;
   }
);

export const rankRouter = router({
   getMyRankInProblem: getMyRankInProblemProcedure,
   getProblemScoreIntervals: getProblemScoreIntervalsProcedure,
   getMyGlobalRankStatistic: getMyGlobalRankStatisticProcedure,
   getMyRankingTrends: getMyRankingTrendsProcedure,
});
