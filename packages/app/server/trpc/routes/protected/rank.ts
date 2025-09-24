import z from 'zod';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import prisma from '@challenge/database';
import { rankService } from '../../services/rank';

const GetMyRankInProblemSchema = z.object({
   recordId: z.number('Record ID must be a number'),
});

const getMyRankInProblem = protectedProcedure
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

      return await rankService.getSelfRank(problemId, recordId);
   });

const GetScoreIntervalsSchema = z.object({
   problemId: z.number('Problem ID must be a number'),
});

const getScoreIntervals = protectedProcedure
   .input(GetScoreIntervalsSchema)
   .query(async ({ input }) => {
      const { problemId } = input;
      return await rankService.getRankIntervals(problemId, 16);
   });

export const rankRouter = router({
   getMyRankInProblem,
   getScoreIntervals,
});
