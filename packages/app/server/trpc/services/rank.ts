import prisma from '@challenge/database';

/**
 * 判断是否存在某题目的排行榜
 */
const existRanking = async (problemId: number) => {
   const redis = useRedis();
   const rankKey = `problem:${problemId}:rankings`;
   return redis.exists(rankKey);
};

/**
 * 载入某题目的排行榜数据
 */
const loadRankings = async (problemId: number) => {
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

   const ttl = useRuntimeConfig().rank.cacheTTL;
   pipeline.expire(rankKey, ttl ?? 3600);
   await pipeline.exec();
};

/**
 * 将提交的最新得分推入排行榜
 */
const pushToRankings = async (
   problemId: number,
   recordId: number,
   score: number
) => {
   if (!(await existRanking(problemId))) {
      await loadRankings(problemId);
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
const getRankIntervals = async (problemId: number, n: number) => {
   if (!(await existRanking(problemId))) {
      await loadRankings(problemId);
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
const getSelfRank = async (problemId: number, record: number) => {
   if (!(await existRanking(problemId))) {
      await loadRankings(problemId);
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

export const rankService = {
   loadRankings,
   pushToRankings,
   getRankIntervals,
   getSelfRank,
   existRanking,
};
