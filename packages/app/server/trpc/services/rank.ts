import { logger } from '~~/lib/logger';
import prisma from '~~/lib/prisma';

/**
 * 判断是否存在某题目的排行榜
 */
const getProblemRankingExistence = async (problemId: number) => {
   const redis = useRedis();
   const rankKey = `problem:${problemId}:rankings`;
   return redis.exists(rankKey);
};

/**
 * 载入某题目的排行榜数据
 */
const loadProblemRankings = async (problemId: number) => {
   const redis = useRedis();

   const rankKey = `problem:${problemId}:rankings`;
   const rankData = await prisma.judgeRecords.findMany({
      where: {
         problemId,
         type: 'judge',
         score: { gt: 0 },
         result: 'success',
      },
      select: { id: true, score: true, createdAt: true },
   });

   const pipeline = redis.pipeline();
   rankData.forEach(({ id, score, createdAt }) => {
      // 加入时间戳，保证分数相同的情况下后提交的排名更靠后
      const _score = score + (1e10 - (createdAt.getTime() % 1e10)) / 1e12;
      pipeline.zadd(rankKey, _score, id);
   });

   const ttl = useRuntimeConfig().rank.problemCacheTTL;
   pipeline.expire(rankKey, ttl ?? 3600);
   await pipeline.exec();
};

/**
 * 将提交的最新得分推入排行榜
 */
const pushToProblemRankings = async (
   problemId: number,
   recordId: number,
   score: number
) => {
   if (!(await getProblemRankingExistence(problemId))) {
      await loadProblemRankings(problemId);
   }

   const redis = useRedis();
   const rankKey = `problem:${problemId}:rankings`;
   // 加入时间戳，保证分数相同的情况下后提交的排名更靠后
   const _score = score + (1e10 - (Date.now() % 1e10)) / 1e12;
   await redis.zadd(rankKey, _score, recordId.toString());
};

/**
 * 获取某题目排行榜的分数区间
 * @returns
 * - score: 分数
 * - count: 该分数及以上的提交数
 */
const getProblemRankingIntervals = async (problemId: number, n: number) => {
   if (!(await getProblemRankingExistence(problemId))) {
      await loadProblemRankings(problemId);
   }

   const redis = useRedis();
   const rankKey = `problem:${problemId}:rankings`;

   const maxScore = await redis.zrevrange(rankKey, 0, 0, 'WITHSCORES');
   if (maxScore.length < 2) {
      return [];
   }
   const max = parseInt(maxScore[1]) + 1;

   const minScore = await redis.zrange(rankKey, 0, 0, 'WITHSCORES');
   if (minScore.length < 2) {
      return [];
   }
   const min = parseInt(minScore[1]);

   const intervalSize = (max - min - 1) / n;
   const intervals: { from: number; to: number; count: number }[] = [];
   for (let i = 0; i < n; i++) {
      const from = i === 0 ? min : min + i * intervalSize;
      const to = i === n - 1 ? max : min + (i + 1) * intervalSize;
      intervals.push({ from, to, count: 0 });
   }

   // 使用 ZCOUNT 获取每个区间的计数
   const pipeline = redis.pipeline();
   intervals.forEach(({ from, to }) => {
      pipeline.zcount(rankKey, from, to);
   });
   const results = (await pipeline.exec()) as [Error | null, number | null][];

   results.forEach((res, idx) => {
      const [err, count] = res;
      if (err) {
         console.error('Error fetching rank interval count:', err);
         intervals[idx].count = 0;
      } else {
         intervals[idx].count = count as number;
      }
   });

   // 修正最后一个区间的上限
   intervals[intervals.length - 1].to = max - 1;
   return intervals;
};

/**
 * 获取记录在某题目中的排名
 * @returns
 * - rank: 排名（1-based）
 * - total: 总记录数
 * - aheadRate: 超越率（0~1 之间）
 */
const getSelfProblemRanking = async (problemId: number, record: number) => {
   if (!(await getProblemRankingExistence(problemId))) {
      await loadProblemRankings(problemId);
   }

   const redis = useRedis();
   const rankKey = `problem:${problemId}:rankings`;

   const rank = await redis.zrevrank(rankKey, record.toString());
   const total = await redis.zcard(rankKey);
   if (rank === null) {
      return { rank: -1, total, aheadRate: 0 };
   }

   return {
      rank: rank + 1,
      total,
      aheadRate: (total - rank - 1) / total,
   };
};

interface IGlobalRanking {
   userId: string;
   score: number;
}

/**
 * 获取全局排行榜
 * @param limit 获取前多少名
 * @returns
 * - userId: 用户 ID
 */
const getGlobalRankings = async (limit: number = 100) => {
   const redis = useRedis();
   const resultKey = `global:rankings-result:limit-${limit}`;

   const result = await redis.get(resultKey);
   if (result) {
      return JSON.parse(result) as IGlobalRanking[];
   }

   const rankingKey = `global:rankings`;
   const existRanking = await redis.exists(rankingKey);
   if (!existRanking) {
      await loadGlobalRankings();
   }

   const userIdWithScore = await redis.zrevrange(
      rankingKey,
      0,
      limit - 1,
      'WITHSCORES'
   );
   const rankings: IGlobalRanking[] = [];
   for (let i = 0; i < userIdWithScore.length; i += 2) {
      rankings.push({
         userId: userIdWithScore[i],
         score: parseFloat(userIdWithScore[i + 1]),
      });
   }
   await redis.set(resultKey, JSON.stringify(rankings), 'EX', 5 * 60);

   return rankings;
};

/**
 * 获取用户在全局排行榜中的排名
 * @param userId 用户ID
 * @returns
 * - rank: 排名（1-based）
 * - total: 总记录数
 * - score: 分数
 * - aheadRate: 超越率（0~1 之间）
 */
const getSelfGlobalRanking = async (userId: string) => {
   const redis = useRedis();
   const rankingKey = `global:rankings`;

   const existRanking = await redis.exists(rankingKey);
   if (!existRanking) {
      await loadGlobalRankings();
   }

   const rank = await redis.zrevrank(rankingKey, userId);
   const score = Number((await redis.zscore(rankingKey, userId)) ?? '0');
   const total = await redis.zcard(rankingKey);
   if (rank === null) {
      return { rank: -1, total, aheadRate: 0, score: 0 };
   }

   return {
      rank: rank + 1,
      score,
      total,
      aheadRate: total === 1 ? 1 : (total - rank - 1) / total,
   };
};

/**
 * 载入全局排行榜数据
 */
const loadGlobalRankings = async () => {
   const redis = useRedis();
   const rankingKey = `global:rankings`;
   const rankData = await prisma.userStatistic.findMany({
      where: { score: { gt: 0 } },
      select: { userId: true, score: true },
   });

   const ttl = useRuntimeConfig().rank.problemCacheTTL;
   const pipeline = redis.pipeline().expire(rankingKey, ttl ?? 3600);

   rankData.forEach(({ userId, score }) => {
      pipeline.zadd(rankingKey, score, userId);
   });

   await pipeline.exec();
};

/**
 * 更新全局排行榜
 * @param userId 用户 ID
 * @param scoreDiff 分数变化值
 */
const udpateGlobalRanking = async (userId: string, scoreDiff: number) => {
   if (scoreDiff === 0) return;

   const redis = useRedis();
   const rankingKey = `global:rankings`;
   const existRanking = await redis.exists(rankingKey);
   if (!existRanking) {
      await loadGlobalRankings();
   }

   await redis.zincrby(rankingKey, scoreDiff, userId);
};

/** 获取全局排行榜的分数区间
 * @returns
 * - from: 区间下限（包含）
 * - to: 区间上限（不包含）
 * - count: 该分数及以上的用户数
 */
const getGlobalRankingIntervals = async (
   n: number
): Promise<{ from: number; to: number; count: number }[]> => {
   const redis = useRedis();
   const rankingKey = `global:rankings`;

   const existRanking = await redis.exists(rankingKey);
   if (!existRanking) {
      await loadGlobalRankings();
   }

   const maxScore = await redis.zrevrange(rankingKey, 0, 0, 'WITHSCORES');
   if (maxScore.length < 2) {
      return Array(n).fill({ from: 0, to: 0, count: 0 });
   }

   const max = parseInt(maxScore[1]) + 1;
   const min = 0;

   const intervalSize = (max - min - 1) / n;
   const intervals: { from: number; to: number; count: number }[] = [];
   for (let i = 0; i < n; i++) {
      const from = i === 0 ? min : min + i * intervalSize;
      const to = i === n - 1 ? max : min + (i + 1) * intervalSize;
      intervals.push({ from, to, count: 0 });
   }

   // 使用 ZCOUNT 获取每个区间的计数
   const pipeline = redis.pipeline();
   intervals.forEach(({ from, to }) => {
      pipeline.zcount(rankingKey, from, to);
   });
   const results = (await pipeline.exec()) as [Error | null, number | null][];

   results.forEach((res, idx) => {
      const [err, count] = res;
      if (err) {
         logger.error('Error fetching rank interval count:', err);
         intervals[idx].count = 0;
      } else {
         intervals[idx].count = count as number;
      }
   });

   // 修正最后一个区间的上限
   intervals[intervals.length - 1].to = max - 1;
   return intervals;
};

export const rankService = {
   loadProblemRankings,
   pushToProblemRankings,
   getProblemRankingIntervals,
   getSelfProblemRanking,
   getSelfGlobalRanking,
   getProblemRankingExistence,
   getGlobalRankings,
   udpateGlobalRanking,
   loadGlobalRankings,
   getGlobalRankingIntervals,
};
