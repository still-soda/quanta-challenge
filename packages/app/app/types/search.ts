/**
 * 搜索相关的类型定义
 */

/**
 * 搜索结果类型
 */
export type SearchResultType = 'problem' | 'user' | 'tag' | 'announcement';

/**
 * 题目难度
 */
export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

/**
 * 搜索结果基础接口
 */
export interface SearchResultBase {
   id: string;
   type: SearchResultType;
   title: string;
   description?: string;
   url?: string;
}

/**
 * 题目搜索结果
 */
export interface ProblemSearchResult extends SearchResultBase {
   type: 'problem';
   metadata: {
      difficulty: ProblemDifficulty;
      tags: string[];
      solvedCount?: number;
      acceptRate?: number;
   };
}

/**
 * 用户搜索结果
 */
export interface UserSearchResult extends SearchResultBase {
   type: 'user';
   metadata: {
      avatar?: string;
      role: string;
      solvedProblems?: number;
   };
}

/**
 * 标签搜索结果
 */
export interface TagSearchResult extends SearchResultBase {
   type: 'tag';
   metadata: {
      problemCount: number;
      color?: string;
   };
}

/**
 * 公告搜索结果
 */
export interface AnnouncementSearchResult extends SearchResultBase {
   type: 'announcement';
   metadata: {
      publishDate: string;
      author?: string;
   };
}

/**
 * 搜索结果联合类型
 */
export type SearchResult =
   | ProblemSearchResult
   | UserSearchResult
   | TagSearchResult
   | AnnouncementSearchResult;

/**
 * 搜索 API 请求参数
 */
export interface SearchParams {
   q: string; // 搜索关键词
   type?: SearchResultType | 'all'; // 搜索类型
   limit?: number; // 结果数量限制
   offset?: number; // 分页偏移量
}

/**
 * 搜索 API 响应
 */
export interface SearchResponse {
   results: SearchResult[];
   total: number;
   hasMore: boolean;
}
