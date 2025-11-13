/**
 * 搜索相关的类型定义
 */

/**
 * 搜索类型（包含 'all'）
 */
export type SearchType =
   | 'all'
   | 'problem'
   | 'user'
   | 'tag'
   | 'page-section'
   | 'daily-problem';

/**
 * 搜索结果类型
 */
export type SearchResultType =
   | 'problem'
   | 'user'
   | 'tag'
   | 'page-section'
   | 'daily-problem';

/**
 * 题目难度
 */
export type ProblemDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard';

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
 * 页面板块搜索结果
 */
export interface PageSectionSearchResult extends SearchResultBase {
   type: 'page-section';
   metadata: {
      pageName: string; // 页面名称，如 "首页"
      sectionName: string; // 板块名称，如 "最近提交"
      icon?: string; // 图标名称
   };
}

/**
 * 每日一题搜索结果
 */
export interface DailyProblemSearchResult extends SearchResultBase {
   type: 'daily-problem';
   metadata: {
      date: string; // 日期
      difficulty: ProblemDifficulty;
      tags: string[];
      isToday: boolean; // 是否是今日题目
   };
}

/**
 * 搜索结果联合类型
 */
export type SearchResult =
   | ProblemSearchResult
   | UserSearchResult
   | TagSearchResult
   | PageSectionSearchResult
   | DailyProblemSearchResult;

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
