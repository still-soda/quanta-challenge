import prisma from '~~/lib/prisma';
import { publicProcedure, router } from '../../trpc';
import dayjs from 'dayjs';
import { dailyService } from '../../services/daily';

const getDailyProblemProcedure = publicProcedure.query(async () => {
   const today = dayjs().startOf('day').toDate();
   const problemQuery = {
      CurrentProblem: {
         select: {
            pid: true,
            title: true,
            difficulty: true,
            totalScore: true,
            tags: { select: { color: true, name: true } },
            CoverImage: { select: { name: true, thumbhash: true } },
            JudgeStatus: { select: { totalCount: true, passedCount: true } },
            ProblemDefaultCover: {
               select: { image: { select: { name: true, thumbhash: true } } },
            },
         },
      },
   };

   let dailyProblem = null;
   const result = await prisma.dailyProblem.findFirst({
      where: { date: today },
      select: {
         baseProblem: {
            select: problemQuery,
         },
      },
   });
   if (!result) {
      const id = await dailyService.selectDailyProblem();
      const temp = await prisma.baseProblems.findUniqueOrThrow({
         where: { id },
         select: problemQuery,
      });
      dailyProblem = temp.CurrentProblem!;
   } else {
      dailyProblem = result.baseProblem.CurrentProblem!;
   }

   const { passedCount = 0, totalCount = 0 } = dailyProblem.JudgeStatus || {};
   const passRate = totalCount === 0 ? 0 : passedCount / totalCount;

   const image =
      dailyProblem.CoverImage ?? dailyProblem.ProblemDefaultCover?.[0].image;
   const coverImageName = image?.name ?? null;
   const coverImageThumbhash = image?.thumbhash ?? null;

   return {
      pid: dailyProblem.pid,
      title: dailyProblem.title,
      difficulty: dailyProblem.difficulty,
      tags: dailyProblem.tags,
      totalScore: dailyProblem.totalScore,
      passRate: passRate,
      coverImageName: coverImageName,
      coverImageThumbhash: coverImageThumbhash,
   };
});

export const dailyRouter = router({
   getProblem: getDailyProblemProcedure,
});
