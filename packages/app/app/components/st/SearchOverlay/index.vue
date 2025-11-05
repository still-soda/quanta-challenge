<script setup lang="ts">
import { Search, Close } from '@icon-park/vue-next';
import type { SearchResult } from '~/types/search';

const {
   isSearchOpen,
   closeSearch,
   searchQuery,
   searchResults,
   isSearching,
   performSearch,
} = useSearch();

const inputRef = ref<HTMLInputElement>();
const localQuery = ref('');
const selectedIndex = ref(-1); // 当前选中的结果索引
const resultsContainerRef = ref<HTMLElement>(); // 结果列表容器

// 监听输入变化执行搜索
const debouncedSearch = useDebounceFn((query: string) => {
   performSearch(query);
}, 300);

watch(localQuery, (newQuery) => {
   debouncedSearch(newQuery);
   // 输入变化时重置选中索引
   selectedIndex.value = -1;
});

// 监听搜索结果变化，重置选中索引
watch(searchResults, () => {
   selectedIndex.value = -1;
});

// 监听选中索引变化，滚动到可见区域
watch(selectedIndex, (newIndex) => {
   if (newIndex >= 0 && resultsContainerRef.value) {
      nextTick(() => {
         const container = resultsContainerRef.value;
         const items = container?.querySelectorAll('[data-result-item]');
         const selectedItem = items?.[newIndex] as HTMLElement;

         if (selectedItem && container) {
            const containerRect = container.getBoundingClientRect();
            const itemRect = selectedItem.getBoundingClientRect();

            // 如果元素不在可见区域，滚动到该元素
            if (itemRect.top < containerRect.top) {
               selectedItem.scrollIntoView({
                  block: 'nearest',
                  behavior: 'smooth',
               });
            } else if (itemRect.bottom > containerRect.bottom) {
               selectedItem.scrollIntoView({
                  block: 'nearest',
                  behavior: 'smooth',
               });
            }
         }
      });
   }
});

// 当覆盖层打开时，聚焦输入框
watch(isSearchOpen, (opened) => {
   if (opened) {
      nextTick(() => {
         inputRef.value?.focus();
      });
   } else {
      // 关闭时清空搜索
      localQuery.value = '';
      searchQuery.value = '';
      selectedIndex.value = -1;
   }
});

// 键盘导航处理
const handleKeydown = (e: KeyboardEvent) => {
   if (e.key === 'Escape') {
      closeSearch();
      return;
   }

   // 只在有搜索结果时处理上下键和回车键
   if (searchResults.value.length === 0) return;

   if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex.value = Math.min(
         selectedIndex.value + 1,
         searchResults.value.length - 1
      );
   } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
   } else if (e.key === 'Enter') {
      e.preventDefault();
      if (
         selectedIndex.value >= 0 &&
         selectedIndex.value < searchResults.value.length
      ) {
         const result = searchResults.value[selectedIndex.value];
         if (result) {
            handleResultClick(result);
         }
      }
   }
};

// 点击背景关闭
const handleBackdropClick = () => {
   closeSearch();
};

// 阻止点击内容区域时关闭
const handleContentClick = (e: Event) => {
   e.stopPropagation();
};

// 点击搜索结果
const handleResultClick = (result: SearchResult) => {
   if (result.url) {
      navigateTo(result.url);
      closeSearch();
   }
};
</script>

<template>
   <Teleport to="body">
      <Transition name="search-overlay">
         <div
            v-if="isSearchOpen"
            class="fixed inset-0 z-[10001] bg-background/50 backdrop-blur-md flex items-start justify-center pt-[20vh]"
            @click="handleBackdropClick"
            @keydown="handleKeydown">
            <div class="w-full max-w-[42rem] mx-4" @click="handleContentClick">
               <!-- 搜索框 -->
               <div
                  class="bg-accent-600 rounded-xl shadow-2xl overflow-hidden border border-accent-500">
                  <!-- 搜索输入区 -->
                  <div class="flex items-center gap-3 px-5 py-3 bg-accent-700">
                     <Search class="text-xl text-accent-300 shrink-0" />
                     <input
                        ref="inputRef"
                        v-model="localQuery"
                        type="text"
                        placeholder="搜索题目、标签、用户、页面..."
                        class="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-accent-300"
                        @keydown.esc="closeSearch" />
                     <button
                        v-if="localQuery"
                        class="text-accent-300 hover:text-white transition-colors p-1"
                        @click="localQuery = ''">
                        <Close class="text-base cursor-pointer" />
                     </button>
                  </div>

                  <!-- 搜索结果区域 -->
                  <div
                     ref="resultsContainerRef"
                     class="max-h-[60vh] overflow-y-auto">
                     <!-- 加载中 -->
                     <div
                        v-if="isSearching"
                        class="px-6 py-12 text-center text-accent-300">
                        <div
                           class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3"></div>
                        <p class="text-sm">搜索中...</p>
                     </div>

                     <!-- 无搜索内容 -->
                     <StSpace
                        v-else-if="!localQuery.trim()"
                        direction="vertical"
                        align="center"
                        gap="0.5rem"
                        class="px-6 py-12 text-center">
                        <Search
                           class="text-5xl text-accent-400 opacity-40 mb-2" />
                        <p class="st-font-body-bold text-white text-sm">
                           输入关键词开始搜索
                        </p>
                        <p class="text-xs text-accent-400">
                           支持搜索题目、用户、标签、页面板块等
                        </p>
                     </StSpace>

                     <!-- 无结果 -->
                     <StSpace
                        v-else-if="!isSearching && searchResults.length === 0"
                        direction="vertical"
                        align="center"
                        gap="0.5rem"
                        class="px-6 py-12 text-center">
                        <div class="text-4xl text-accent-400 opacity-40 mb-2">
                           ∅
                        </div>
                        <p class="st-font-body-bold text-white text-sm">
                           未找到相关结果
                        </p>
                        <p class="text-xs text-accent-400">
                           尝试使用其他关键词或简化搜索条件
                        </p>
                     </StSpace>

                     <!-- 搜索结果列表 -->
                     <div v-else class="divide-y divide-accent-500">
                        <StSearchOverlaySearchResultItem
                           v-for="(result, index) in searchResults"
                           :key="result.id"
                           :result="result"
                           :is-selected="index === selectedIndex"
                           data-result-item
                           @click="handleResultClick" />
                     </div>
                  </div>

                  <!-- 底部提示 -->
                  <div
                     class="px-5 py-2.5 bg-accent-700 border-t border-accent-500 flex items-center justify-between text-xs text-accent-300">
                     <StSpace gap="1rem" align="center">
                        <StSpace gap="0.25rem" align="center">
                           <kbd
                              class="px-1.5 py-0.5 bg-accent-600 rounded border border-accent-500 text-[0.625rem]">
                              ↑
                           </kbd>
                           <kbd
                              class="px-1.5 py-0.5 bg-accent-600 rounded border border-accent-500 text-[0.625rem]">
                              ↓
                           </kbd>
                           <span>导航</span>
                        </StSpace>
                        <StSpace gap="0.25rem" align="center">
                           <kbd
                              class="px-1.5 py-0.5 bg-accent-600 rounded border border-accent-500 text-[0.625rem]">
                              Enter
                           </kbd>
                           <span>选择</span>
                        </StSpace>
                        <StSpace gap="0.25rem" align="center">
                           <kbd
                              class="px-1.5 py-0.5 bg-accent-600 rounded border border-accent-500 text-[0.625rem]">
                              Esc
                           </kbd>
                           <span>关闭</span>
                        </StSpace>
                     </StSpace>
                     <div
                        v-if="searchResults.length > 0"
                        class="text-accent-400">
                        共 {{ searchResults.length }} 条
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </Transition>
   </Teleport>
</template>

<style scoped>
.search-overlay-enter-active,
.search-overlay-leave-active {
   transition: opacity 0.2s ease;
}

.search-overlay-enter-from,
.search-overlay-leave-to {
   opacity: 0;
}

.search-overlay-enter-active > div,
.search-overlay-leave-active > div {
   transition: transform 0.2s ease, opacity 0.2s ease;
}

.search-overlay-enter-from > div {
   transform: translateY(-1rem);
   opacity: 0;
}

.search-overlay-leave-to > div {
   transform: translateY(-1rem);
   opacity: 0;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
   width: 8px;
}

::-webkit-scrollbar-track {
   background: transparent;
}

::-webkit-scrollbar-thumb {
   background: rgb(var(--color-accent-500));
   border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
   background: rgb(var(--color-accent-400));
}
</style>
