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

// 监听输入变化执行搜索
const debouncedSearch = useDebounceFn((query: string) => {
   performSearch(query);
}, 300);

watch(localQuery, (newQuery) => {
   debouncedSearch(newQuery);
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
   }
});

// ESC 键关闭
const handleKeydown = (e: KeyboardEvent) => {
   if (e.key === 'Escape') {
      closeSearch();
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
                  class="bg-accent-700 rounded-xl shadow-2xl overflow-hidden border border-accent-500">
                  <div
                     class="flex items-center gap-3 px-6 py-4 border-b border-accent-500">
                     <Search class="text-2xl text-accent-300 shrink-0" />
                     <input
                        ref="inputRef"
                        v-model="localQuery"
                        type="text"
                        placeholder="搜索题目、标签、用户..."
                        class="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-accent-300"
                        @keydown.esc="closeSearch" />
                     <button
                        v-if="localQuery"
                        class="text-accent-300 hover:text-white transition-colors"
                        @click="localQuery = ''">
                        <Close class="text-xl cursor-pointer" />
                     </button>
                  </div>

                  <!-- 搜索结果区域 -->
                  <div class="max-h-[60vh] overflow-y-auto">
                     <!-- 加载中 -->
                     <div
                        v-if="isSearching"
                        class="px-6 py-12 text-center text-accent-300">
                        <div
                           class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-300 border-t-transparent"></div>
                        <p class="mt-4">搜索中...</p>
                     </div>

                     <!-- 无搜索内容 -->
                     <StSpace
                        v-else-if="!localQuery.trim()"
                        direction="vertical"
                        align="center"
                        gap="0.5rem"
                        class="px-6 py-12 text-center text-accent-300">
                        <Search class="text-5xl mx-auto mb-4 opacity-50" />
                        <p class="st-font-body-bold">输入关键词开始搜索</p>
                        <p class="text-sm mt-2 opacity-70">
                           支持搜索题目、标签、用户等
                        </p>
                     </StSpace>

                     <!-- 无结果 -->
                     <div
                        v-else-if="!isSearching && searchResults.length === 0"
                        class="px-6 py-12 text-center text-accent-300">
                        <p class="st-font-body-bold">未找到相关结果</p>
                        <p class="text-sm mt-2 opacity-70">
                           尝试使用其他关键词搜索
                        </p>
                     </div>

                     <!-- 搜索结果列表 -->
                     <div v-else class="divide-y divide-accent-500">
                        <StSearchOverlaySearchResultItem
                           v-for="result in searchResults"
                           :key="result.id"
                           :result="result"
                           @click="handleResultClick" />
                     </div>
                  </div>

                  <!-- 底部提示 -->
                  <div
                     class="px-6 py-3 bg-accent-800 border-t border-accent-500 flex items-center justify-between text-xs text-accent-300">
                     <div class="flex items-center gap-4">
                        <div class="flex items-center gap-1">
                           <kbd
                              class="px-2 py-1 bg-accent-700 rounded border border-accent-500">
                              ↑
                           </kbd>
                           <kbd
                              class="px-2 py-1 bg-accent-700 rounded border border-accent-500">
                              ↓
                           </kbd>
                           <span class="ml-1">选择</span>
                        </div>
                        <div class="flex items-center gap-1">
                           <kbd
                              class="px-2 py-1 bg-accent-700 rounded border border-accent-500">
                              Enter
                           </kbd>
                           <span class="ml-1">打开</span>
                        </div>
                     </div>
                     <div class="flex items-center gap-1">
                        <kbd
                           class="px-2 py-1 bg-accent-700 rounded border border-accent-500">
                           Esc
                        </kbd>
                        <span class="ml-1">关闭</span>
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
