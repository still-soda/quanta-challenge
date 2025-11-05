import { z } from 'zod';

/**
 * 搜索请求 Schema
 */
export const searchQuerySchema = z.object({
   q: z.string().min(1, '搜索关键词不能为空').max(100, '搜索关键词过长'),
   type: z
      .enum(['all', 'problem', 'user', 'tag', 'page-section', 'daily-problem'])
      .optional()
      .default('all'),
   limit: z.number().int().min(1).max(50).optional().default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
