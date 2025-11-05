<script setup lang="ts">
import { ListTwo, User, Tag, Message } from '@icon-park/vue-next';
import type { SearchResult } from '~/types/search';

const props = defineProps<{
   result: SearchResult;
}>();

const emit = defineEmits<{
   click: [result: SearchResult];
}>();

const icon = computed(() => {
   switch (props.result.type) {
      case 'problem':
         return ListTwo;
      case 'user':
         return User;
      case 'tag':
         return Tag;
      case 'announcement':
         return Message;
   }
});

const typeText = computed(() => {
   switch (props.result.type) {
      case 'problem':
         return '题目';
      case 'user':
         return '用户';
      case 'tag':
         return '标签';
      case 'announcement':
         return '公告';
   }
});

const handleClick = () => {
   emit('click', props.result);
};
</script>

<template>
   <div
      class="px-6 py-4 hover:bg-accent-600 transition-colors cursor-pointer"
      @click="handleClick">
      <div class="flex items-start gap-3">
         <!-- 图标 -->
         <div class="shrink-0 mt-1">
            <component
               :is="icon"
               class="text-xl"
               :class="{
                  'text-primary': result.type === 'problem',
                  'text-secondary': result.type === 'user',
                  'text-success': result.type === 'tag',
                  'text-warning': result.type === 'announcement',
               }" />
         </div>

         <!-- 内容 -->
         <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
               <!-- 标题 -->
               <h3 class="text-white st-font-body-bold truncate">
                  {{ result.title }}
               </h3>

               <!-- 类型标签 -->
               <span
                  class="text-xs px-2 py-0.5 rounded"
                  :class="{
                     'bg-primary/20 text-primary': result.type === 'problem',
                     'bg-secondary/20 text-secondary': result.type === 'user',
                     'bg-success/20 text-success': result.type === 'tag',
                     'bg-warning/20 text-warning':
                        result.type === 'announcement',
                  }">
                  {{ typeText }}
               </span>

               <!-- 题目难度标签 -->
               <span
                  v-if="result.type === 'problem'"
                  class="text-xs px-2 py-0.5 rounded"
                  :class="{
                     'bg-success/20 text-success':
                        result.metadata.difficulty === 'easy',
                     'bg-warning/20 text-warning':
                        result.metadata.difficulty === 'medium',
                     'bg-error/20 text-error':
                        result.metadata.difficulty === 'hard',
                  }">
                  {{
                     result.metadata.difficulty === 'easy'
                        ? '简单'
                        : result.metadata.difficulty === 'medium'
                        ? '中等'
                        : '困难'
                  }}
               </span>
            </div>

            <!-- 描述 -->
            <p
               v-if="result.description"
               class="text-accent-300 text-sm mt-1 line-clamp-2">
               {{ result.description }}
            </p>

            <!-- 元数据 -->
            <div
               v-if="result.type === 'problem'"
               class="flex items-center gap-3 mt-2 text-xs text-accent-300">
               <span v-if="result.metadata.solvedCount">
                  已解决: {{ result.metadata.solvedCount }}
               </span>
               <span v-if="result.metadata.acceptRate">
                  通过率: {{ (result.metadata.acceptRate * 100).toFixed(1) }}%
               </span>
               <div v-if="result.metadata.tags.length > 0" class="flex gap-1">
                  <span
                     v-for="tag in result.metadata.tags.slice(0, 3)"
                     :key="tag"
                     class="px-1.5 py-0.5 bg-accent-700 rounded">
                     {{ tag }}
                  </span>
               </div>
            </div>

            <div
               v-else-if="result.type === 'user'"
               class="flex items-center gap-3 mt-2 text-xs text-accent-300">
               <span>{{ result.metadata.role }}</span>
               <span v-if="result.metadata.solvedProblems">
                  已解决: {{ result.metadata.solvedProblems }} 题
               </span>
            </div>

            <div
               v-else-if="result.type === 'tag'"
               class="mt-2 text-xs text-accent-300">
               <span>{{ result.metadata.problemCount }} 道题目</span>
            </div>

            <div
               v-else-if="result.type === 'announcement'"
               class="mt-2 text-xs text-accent-300">
               <span>{{
                  new Date(result.metadata.publishDate).toLocaleDateString()
               }}</span>
               <span v-if="result.metadata.author" class="ml-2">
                  作者: {{ result.metadata.author }}
               </span>
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
.line-clamp-2 {
   display: -webkit-box;
   -webkit-line-clamp: 2;
   line-clamp: 2;
   -webkit-box-orient: vertical;
   overflow: hidden;
}
</style>
