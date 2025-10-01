import prisma from '@challenge/database';
import { publicProcedure, router } from '../../trpc';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';

async function selectDailyProblem() {
   const today = dayjs().startOf('day').toDate();
   const redis = useRedis();
   const key = `daily_problem:${dayjs(today).format('YYYYMMDD')}`;

   let cached = await redis.get(key);

   if (!cached) {
      const unusedProblemId = (
         await prisma.$queryRaw<{ pid: number }[]>`
            SELECT pid FROM problems
            WHERE pid NOT IN (SELECT "problemId" FROM daily_problems)
            ORDER BY RANDOM()
            LIMIT 1
         `
      )[0]?.pid;
      if (unusedProblemId === void 0) {
         throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No unused problem available for daily challenge',
         });
      }

      const success = await redis.setnx(key, unusedProblemId.toString());
      if (success) {
         await redis.expireat(key, dayjs(today).add(1, 'hour').unix());
         cached = unusedProblemId.toString();
         await prisma.dailyProblem.create({
            data: {
               date: today,
               problemId: unusedProblemId,
            },
         });
         return unusedProblemId;
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
      problem: {
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
      select: problemQuery,
   });
   if (!result) {
      const pid = await selectDailyProblem();
      dailyProblem = await prisma.problems.findUniqueOrThrow({
         where: { pid },
         select: problemQuery['problem']['select'],
      });
   } else {
      dailyProblem = result.problem;
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
