import prisma from '~~/lib/prisma';
import { publicProcedure, router } from '../../trpc';
import z from 'zod';

const GetAllPublicProblemsSchema = z.object({
   tids: z.array(z.number('Tag ID must be a number')).optional(),
});

const getAllPublicProblems = publicProcedure
   .input(GetAllPublicProblemsSchema)
   .query(async ({ input }) => {
      const filter =
         input.tids && input.tids.length > 0
            ? { tags: { some: { tid: { in: input.tids } } } }
            : {};
      const problems = await prisma.baseProblems.findMany({
         where: {
            CurrentProblem: {
               status: 'published',
               ...filter,
            },
         },
         select: {
            CurrentProblem: {
               select: {
                  pid: true,
                  title: true,
                  difficulty: true,
                  totalScore: true,
                  tags: {
                     select: {
                        name: true,
                        color: true,
                     },
                  },
                  JudgeStatus: {
                     select: {
                        totalCount: true,
                        passedCount: true,
                     },
                  },
                  CoverImage: {
                     select: {
                        name: true,
                        thumbhash: true,
                     },
                  },
                  ProblemDefaultCover: {
                     select: {
                        image: {
                           select: { name: true, thumbhash: true },
                        },
                     },
                  },
               },
            },
         },
      });
      return problems.map((p) => {
         const passCount = p.CurrentProblem?.JudgeStatus?.passedCount ?? 0;
         const totalCount = p.CurrentProblem?.JudgeStatus?.totalCount ?? 0;
         const passRate = totalCount === 0 ? 0 : (passCount / totalCount) * 100;
         return {
            ...p.CurrentProblem,
            imageName:
               p.CurrentProblem?.CoverImage?.name ||
               p.CurrentProblem?.ProblemDefaultCover[0].image?.name ||
               'unknown',
            imageHash:
               p.CurrentProblem?.CoverImage?.thumbhash ||
               p.CurrentProblem?.ProblemDefaultCover[0].image?.thumbhash ||
               null,
            passRate,
            CoverImage: undefined,
            ProblemDefaultCover: undefined,
            JudgeStatus: undefined,
         };
      });
   });

export const problemRouter = router({
   listPublicProblems: getAllPublicProblems,
});
