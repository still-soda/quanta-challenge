import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import prisma from '~~/lib/prisma';

const selectDailyProblemFallback = async () => {
   const fallbackBaseProblemId = (
      await prisma.$queryRaw<{ id: number }[]>`
         WITH existing_daily AS (
            SELECT DISTINCT "baseProblemId" AS id, date 
            FROM daily_problems
            ORDER BY date DESC
         )
         SELECT id FROM existing_daily
         ORDER BY date ASC
         LIMIT 1
      `
   )[0]?.id;
   if (fallbackBaseProblemId === void 0) {
      throw new TRPCError({
         code: 'INTERNAL_SERVER_ERROR',
         message: 'No base problem available for daily challenge',
      });
   }
   return fallbackBaseProblemId;
};

/**
 * 抽取当日的每日一题
 * 1. 检查 Redis 缓存中是否已有今日题目。
 * 2. 若无缓存，从数据库中随机选择一个未被使用过的题目。
 * 3. 将选中的题目 ID 存入 Redis，设置过期时间为次日凌晨1点。
 * 4. 将选中的题目记录到数据库的 `daily_problems` 表中。
 * @returns 选中的题目 ID
 */
const selectDailyProblem = async () => {
   const today = dayjs().startOf('day').toDate();
   const redis = useRedis();
   const key = `daily_problem:${dayjs(today).format('YYYYMMDD')}`;

   let cached = await redis.get(key);

   if (!cached) {
      let unusedBaseProblemId = (
         await prisma.$queryRaw<{ id: number }[]>`
            SELECT id FROM base_problems
            LEFT JOIN problems 
              ON base_problems."currentPid" = problems.pid
            WHERE id NOT IN (SELECT "baseProblemId" FROM daily_problems)
              AND problems.pid IS NOT NULL
              AND problems.status = 'published'
            ORDER BY RANDOM()
            LIMIT 1
         `
      )[0]?.id;
      if (unusedBaseProblemId === void 0) {
         unusedBaseProblemId = await selectDailyProblemFallback();
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
};

/**
 * 计算当月连续签到天数
 * 1. 获取用户当月的所有签到记录，按日期降序排列。
 * 2. 遍历签到记录，计算从最近一次签到开始的连续签到天数。
 * 3. 如果遇到未连续的日期，则停止计数。
 * @param userId 用户 ID
 */
const countContinuesCheckin = async (userId: string) => {
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
      const checkinDay = dayjs(checkins[i].date);
      if (i === 0) {
         const [today, yesterday] = [dayjs(), dayjs().subtract(1, 'day')];
         if (
            checkinDay.isSame(today, 'day') ||
            checkinDay.isSame(yesterday, 'day')
         ) {
            count++;
         } else {
            break;
         }
      } else {
         const prevCheckinDay = dayjs(checkins[i - 1].date);
         if (checkinDay.isSame(prevCheckinDay.subtract(1, 'day'), 'day')) {
            count++;
         } else {
            break;
         }
      }
   }

   return count;
};

export const dailyService = {
   countContinuesCheckin,
   selectDailyProblem,
};
