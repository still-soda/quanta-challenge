import type { SearchResult } from '~/types/search';

/**
 * 全局搜索状态管理
 */
export const useSearch = () => {
   const isSearchOpen = useState('search-overlay-open', () => false);

   const openSearch = () => {
      isSearchOpen.value = true;
   };

   const closeSearch = () => {
      isSearchOpen.value = false;
   };

   const toggleSearch = () => {
      isSearchOpen.value = !isSearchOpen.value;
   };

   // 搜索关键词
   const searchQuery = useState('search-query', () => '');

   // 搜索结果（预留接口）
   const searchResults = useState<SearchResult[]>('search-results', () => []);

   // 是否正在搜索
   const isSearching = useState('is-searching', () => false);

   /**
    * 执行搜索（预留接口）
    * @param query 搜索关键词
    */
   const performSearch = async (query: string) => {
      if (!query.trim()) {
         searchResults.value = [];
         return;
      }

      isSearching.value = true;
      searchQuery.value = query;

      try {
         // TODO: 实现实际的搜索逻辑
         // const results = await $fetch('/api/search', { query: { q: query } });
         // searchResults.value = results;

         // 临时模拟数据
         await new Promise((resolve) => setTimeout(resolve, 300));
         searchResults.value = [];
      } catch (error) {
         console.error('搜索失败:', error);
         searchResults.value = [];
      } finally {
         isSearching.value = false;
      }
   };

   return {
      isSearchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      searchQuery,
      searchResults,
      isSearching,
      performSearch,
   };
};
