import prisma from '~~/lib/prisma';
import { publicProcedure, router } from '../../trpc';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';

async function selectDailyProblem() {
   const today = dayjs().startOf('day').toDate();
   const redis = useRedis();
   const key = `daily_problem:${dayjs(today).format('YYYYMMDD')}`;

   let cached = await redis.get(key);

   if (!cached) {
      const unusedBaseProblemId = (
         await prisma.$queryRaw<{ id: number }[]>`
            SELECT id FROM base_problems
            WHERE id NOT IN (SELECT "baseProblemId" FROM daily_problems)
              AND "currentPid" IS NOT NULL
            ORDER BY RANDOM()
            LIMIT 1
         `
      )[0]?.id;
      if (unusedBaseProblemId === void 0) {
         throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No unused base problem available for daily challenge',
         });
      }

      const success = await redis.setnx(key, unusedBaseProblemId.toString());
      if (success) {
         await redis.expireat(key, dayjs(today).add(1, 'hour').unix());
         cached = unusedBaseProblemId.toString();
         await prisma.dailyProblem.create({
            data: {
               date: today,
               baseProblemId: unusedBaseProblemId,
            },
         });
         return unusedBaseProblemId;
      }

      cached = await redis.get(key);
      if (!cached) {
         throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve daily problem',
         });
      }
   }

   return parseInt(cached, 10);
}

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
      const id = await selectDailyProblem();
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
