import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import { searchQuerySchema, SearchType } from '../../schemas/search';
import prisma from '~~/lib/prisma';
import type {
   SearchResult,
   ProblemSearchResult,
   UserSearchResult,
   TagSearchResult,
   PageSectionSearchResult,
   DailyProblemSearchResult,
} from '~/types/search';

/**
 * 页面板块配置
 * 这些是可以被搜索到的页面板块
 */
const PAGE_SECTIONS = [
   {
      id: 'dashboard-recent-submission',
      pageName: '仪表盘',
      sectionName: '最近提交',
      url: '/app/dashboard',
      keywords: [
         '首页',
         '仪表盘',
         'dashboard',
         '最近',
         '提交',
         'submission',
         'zuijingtijiao',
      ],
   },
   {
      id: 'dashboard-recent-learning',
      pageName: '仪表盘',
      sectionName: '最近学习',
      url: '/app/dashboard',
      keywords: [
         '首页',
         '仪表盘',
         'dashboard',
         '最近',
         '学习',
         'learning',
         'yibiaopan',
         'shouye',
      ],
   },
   {
      id: 'dashboard-daily-challenge',
      pageName: '仪表盘',
      sectionName: '每日一题',
      url: '/app/dashboard',
      keywords: [
         '首页',
         '仪表盘',
         'dashboard',
         '每日',
         '一题',
         'daily',
         'challenge',
         'meiriyiti',
         'timu',
         'shouye',
      ],
   },
   {
      id: 'dashboard-ranking',
      pageName: '仪表盘',
      sectionName: '排行榜',
      url: '/app/dashboard',
      keywords: [
         '首页',
         '仪表盘',
         'dashboard',
         '排行',
         '排名',
         'ranking',
         'leaderboard',
         'paihangbang',
         'shouye',
      ],
   },
   {
      id: 'problems-list',
      pageName: '题库',
      sectionName: '题目列表',
      url: '/app/problems',
      keywords: ['题库', '题目', 'problems', '列表', 'list', 'timu', 'tiku'],
   },
   {
      id: 'space',
      pageName: '个人空间',
      sectionName: '个人信息',
      url: '/app/space',
      keywords: [
         '个人',
         '中心',
         '信息',
         'profile',
         'user',
         'gerenkongjian',
         'space',
      ],
   },
   {
      id: 'rankings',
      pageName: '排行榜',
      sectionName: '全部排行',
      url: '/app/rankings',
      keywords: [
         '排行',
         '排名',
         '排行榜',
         'ranking',
         'leaderboard',
         'paihangbang',
      ],
   },
   {
      id: 'settings-common',
      pageName: '设置',
      sectionName: '常规设置',
      url: '/app/settings',
      keywords: ['设置', '常规', 'settings', 'common', 'shezhi', 'changgui'],
   },
   {
      id: 'settings-security',
      pageName: '设置',
      sectionName: '安全设置',
      url: '/app/settings/security',
      keywords: ['设置', '安全', 'settings', 'security', 'shezhi', 'anquan'],
   },
   {
      id: 'settings-advanced',
      pageName: '设置',
      sectionName: '高级设置',
      url: '/app/settings/advanced',
      keywords: ['设置', '高级', 'settings', 'advanced', 'shezhi', 'gaoji'],
   },
];

/**
 * 搜索 Procedure
 */
const searchProcedure = protectedProcedure
   .input(searchQuerySchema)
   .query(async ({ input }) => {
      const { q, type, limit } = input;
      const searchQuery = q.trim().toLowerCase();
      const results: SearchResult[] = [];

      const types: Set<SearchType> = new Set(type.split(',') as SearchType[]);

      try {
         // 1. 搜索题目
         if (types.has('all') || types.has('problem')) {
            const problems = await prisma.baseProblems.findMany({
               where: {
                  CurrentProblem: {
                     OR: [
                        // 按 ID 搜索（完全匹配）
                        {
                           pid: isNaN(Number(searchQuery))
                              ? undefined
                              : Number(searchQuery),
                        },
                        // 按标题搜索
                        {
                           title: {
                              contains: searchQuery,
                              mode: 'insensitive',
                           },
                        },
                     ],
                  },
               },
               include: {
                  CurrentProblem: {
                     include: {
                        tags: true,
                     },
                  },
               },
               take: limit,
            });

            const problemResults: ProblemSearchResult[] = problems
               .filter((p) => p.CurrentProblem)
               .map((p) => ({
                  id: `problem-${p.id}`,
                  type: 'problem' as const,
                  title: p.CurrentProblem!.title,
                  description: p.CurrentProblem!.detail.substring(0, 100),
                  url: `/challenge/${p.id}`,
                  metadata: {
                     difficulty: p.CurrentProblem!.difficulty,
                     tags: p.CurrentProblem!.tags.map((t) => t.name),
                     solvedCount: 0, // TODO: 添加解决数统计
                     acceptRate: 0, // TODO: 添加通过率统计
                  },
               }));

            results.push(...problemResults);
         }

         // 2. 按标签搜索题目
         if (types.has('all') || types.has('tag')) {
            const tags = await prisma.tags.findMany({
               where: {
                  name: {
                     contains: searchQuery,
                     mode: 'insensitive',
                  },
               },
               include: {
                  Problem: {
                     take: 5, // 每个标签最多显示5个题目
                     include: {
                        tags: true,
                     },
                  },
               },
               take: limit,
            });

            // 添加标签结果
            const tagResults: TagSearchResult[] = tags.map((tag) => ({
               id: `tag-${tag.tid}`,
               type: 'tag' as const,
               title: tag.name,
               description:
                  tag.description || `包含 ${tag.Problem.length} 道题目`,
               url: `/app/problems?tag=${tag.tid}`,
               metadata: {
                  problemCount: tag.Problem.length,
                  color: tag.color || undefined,
               },
            }));

            results.push(...tagResults);

            // 如果直接搜索标签，也把对应标签的题目加入结果
            if (type === 'tag') {
               for (const tag of tags) {
                  const tagProblemResults: ProblemSearchResult[] =
                     tag.Problem.map((problem) => ({
                        id: `problem-${problem.pid}`,
                        type: 'problem' as const,
                        title: problem.title,
                        description: problem.detail.substring(0, 100),
                        url: `/challenge/${problem.pid}`,
                        metadata: {
                           difficulty: problem.difficulty,
                           tags: problem.tags.map((t) => t.name),
                           solvedCount: 0,
                           acceptRate: 0,
                        },
                     }));

                  results.push(...tagProblemResults);
               }
            }
         }

         // 3. 搜索用户
         if (types.has('all') || types.has('user')) {
            const users = await prisma.user.findMany({
               where: {
                  OR: [
                     // 按 ID 搜索
                     {
                        id: searchQuery,
                     },
                     // 按用户名搜索
                     {
                        name: {
                           contains: searchQuery,
                           mode: 'insensitive',
                        },
                     },
                     // 按显示名称搜索
                     {
                        displayName: {
                           contains: searchQuery,
                           mode: 'insensitive',
                        },
                     },
                  ],
               },
               include: {
                  avatar: true,
                  UserStatistic: true,
               },
               take: limit,
            });

            const userResults: UserSearchResult[] = users.map((user) => ({
               id: `user-${user.id}`,
               type: 'user' as const,
               title: user.displayName || user.name,
               description: `@${user.name}`,
               url: `/app/space/${user.name}`,
               metadata: {
                  avatar: user.avatar?.name, // 使用 name 字段作为头像标识
                  role: user.role,
                  solvedProblems: user.UserStatistic?.passCount || 0,
               },
            }));

            results.push(...userResults);
         }

         // 4. 搜索页面板块
         if (types.has('all') || types.has('page-section')) {
            const matchingSections = PAGE_SECTIONS.filter((section) =>
               section.keywords.some((keyword) =>
                  keyword.toLowerCase().includes(searchQuery)
               )
            );

            const sectionResults: PageSectionSearchResult[] =
               matchingSections.map((section) => ({
                  id: section.id,
                  type: 'page-section' as const,
                  title: `${section.pageName} - ${section.sectionName}`,
                  description: `快速跳转到 ${section.sectionName}`,
                  url: section.url,
                  metadata: {
                     pageName: section.pageName,
                     sectionName: section.sectionName,
                  },
               }));

            results.push(...sectionResults);
         }

         // 5. 搜索每日一题
         if (types.has('all') || types.has('daily-problem')) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 构建搜索条件
            const dailyProblemWhere: any = {
               date: {
                  gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 最近30天
               },
               baseProblem: {
                  CurrentProblem: {
                     OR: [
                        // 按题目标题搜索
                        {
                           title: {
                              contains: searchQuery,
                              mode: 'insensitive',
                           },
                        },
                        // 按题目详情搜索
                        {
                           detail: {
                              contains: searchQuery,
                              mode: 'insensitive',
                           },
                        },
                        // 按标签搜索
                        {
                           tags: {
                              some: {
                                 name: {
                                    contains: searchQuery,
                                    mode: 'insensitive',
                                 },
                              },
                           },
                        },
                     ],
                  },
               },
            };

            const dailyProblems = await prisma.dailyProblem.findMany({
               where: dailyProblemWhere,
               include: {
                  baseProblem: {
                     include: {
                        CurrentProblem: {
                           include: {
                              tags: true,
                           },
                        },
                     },
                  },
               },
               orderBy: {
                  date: 'desc',
               },
               take: 10,
            });

            const dailyResults: DailyProblemSearchResult[] = dailyProblems
               .filter((dp) => dp.baseProblem.CurrentProblem)
               .map((dp) => {
                  const isToday =
                     dp.date.toDateString() === today.toDateString();
                  return {
                     id: `daily-${dp.id}`,
                     type: 'daily-problem' as const,
                     title: `${isToday ? '今日题目' : '每日一题'}：${
                        dp.baseProblem.CurrentProblem!.title
                     }`,
                     description: `${dp.date.toLocaleDateString(
                        'zh-CN'
                     )} - ${dp.baseProblem.CurrentProblem!.detail.substring(
                        0,
                        80
                     )}`,
                     url: `/challenge/${dp.baseProblem.id}`,
                     metadata: {
                        date: dp.date.toISOString(),
                        difficulty: dp.baseProblem.CurrentProblem!.difficulty,
                        tags: dp.baseProblem.CurrentProblem!.tags.map(
                           (t) => t.name
                        ),
                        isToday,
                     },
                  };
               });

            results.push(...dailyResults);
         }

         // 按相关性排序（简单实现：精确匹配优先）
         const sortedResults = results.sort((a, b) => {
            const aExactMatch = a.title.toLowerCase().includes(searchQuery);
            const bExactMatch = b.title.toLowerCase().includes(searchQuery);

            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;

            // 相同类型的放在一起
            if (a.type !== b.type) {
               const typeOrder = [
                  'daily-problem',
                  'problem',
                  'user',
                  'tag',
                  'page-section',
               ];
               return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
            }

            return 0;
         });

         // 限制总结果数量
         const finalResults = sortedResults.slice(0, limit);

         return {
            results: finalResults,
            total: finalResults.length,
            hasMore: sortedResults.length > limit,
         };
      } catch (error) {
         console.error('搜索失败:', error);
         throw new Error('搜索失败，请稍后重试');
      }
   });

export const searchRouter = router({
   search: searchProcedure,
});
