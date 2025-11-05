<script setup lang="ts">
import {
   ListTwo,
   User,
   Tag,
   Calendar,
   ApplicationMenu,
   Check,
   ChartProportion,
   Time,
   Fire,
} from '@icon-park/vue-next';
import type { SearchResult } from '~/types/search';

const props = defineProps<{
   result: SearchResult;
   isSelected?: boolean;
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
      case 'daily-problem':
         return Calendar;
      case 'page-section':
         return ApplicationMenu;
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
      case 'daily-problem':
         return '每日一题';
      case 'page-section':
         return '页面';
   }
});

const difficultyText = (difficulty: string) => {
   switch (difficulty) {
      case 'easy':
         return '简单';
      case 'medium':
         return '中等';
      case 'hard':
         return '困难';
      case 'very_hard':
         return '极难';
      default:
         return difficulty;
   }
};

const difficultyColor = (difficulty: string) => {
   switch (difficulty) {
      case 'easy':
         return 'bg-success/20 text-success';
      case 'medium':
         return 'bg-warning/20 text-warning';
      case 'hard':
         return 'bg-error/20 text-error';
      case 'very_hard':
         return 'bg-purple-500/20 text-purple-400';
      default:
         return 'bg-accent-600 text-accent-300';
   }
};

const typeColor = computed(() => {
   switch (props.result.type) {
      case 'problem':
         return 'text-primary';
      case 'user':
         return 'text-secondary';
      case 'tag':
         return 'text-success';
      case 'daily-problem':
         return 'text-warning';
      case 'page-section':
         return 'text-accent-300';
      default:
         return 'text-accent-300';
   }
});

const typeBgColor = computed(() => {
   switch (props.result.type) {
      case 'problem':
         return 'bg-primary/20 text-primary';
      case 'user':
         return 'bg-secondary/20 text-secondary';
      case 'tag':
         return 'bg-success/20 text-success';
      case 'daily-problem':
         return 'bg-warning/20 text-warning';
      case 'page-section':
         return 'bg-accent-500 text-accent-200';
      default:
         return 'bg-accent-500 text-accent-300';
   }
});

const handleClick = () => {
   emit('click', props.result);
};
</script>

<template>
   <div
      class="group px-4 py-2.5 hover:bg-accent-500 transition-colors cursor-pointer"
      :class="{ 'bg-accent-500': isSelected }"
      @click="handleClick">
      <StSpace gap="0.75rem" align="center" fill-x>
         <!-- 图标 -->
         <component :is="icon" class="text-lg shrink-0" :class="typeColor" />

         <!-- 内容区域 -->
         <StSpace direction="vertical" gap="0.25rem" fill-x class="min-w-0">
            <!-- 标题行 -->
            <StSpace gap="0.5rem" align="center" fill-x no-wrap>
               <!-- 标题 -->
               <h3 class="text-white text-sm font-medium truncate flex-1">
                  {{ result.title }}
               </h3>

               <!-- 标签组 -->
               <StSpace gap="0.25rem" align="center" no-wrap class="shrink-0">
                  <!-- 类型标签 -->
                  <span
                     class="text-[0.625rem] px-1.5 py-0.5 rounded bg-accent-600 text-accent-200 leading-none whitespace-nowrap">
                     {{ typeText }}
                  </span>

                  <!-- 难度标签 -->
                  <span
                     v-if="
                        result.type === 'problem' ||
                        result.type === 'daily-problem'
                     "
                     class="text-[0.625rem] px-1.5 py-0.5 rounded leading-none whitespace-nowrap"
                     :class="difficultyColor(result.metadata.difficulty)">
                     {{ difficultyText(result.metadata.difficulty) }}
                  </span>

                  <!-- 今日标记 -->
                  <StSpace
                     v-if="
                        result.type === 'daily-problem' &&
                        result.metadata.isToday
                     "
                     gap="0.25rem"
                     align="center"
                     class="text-[0.625rem] px-1.5 py-0.5 rounded bg-primary/20 text-primary leading-none whitespace-nowrap">
                     <Fire theme="filled" size="10" />
                     <span>今日</span>
                  </StSpace>
               </StSpace>
            </StSpace>

            <!-- 元数据行 -->
            <StSpace
               gap="0.75rem"
               align="center"
               class="text-xs text-accent-300">
               <!-- 题目元数据 -->
               <template v-if="result.type === 'problem'">
                  <StSpace
                     v-if="result.metadata.solvedCount"
                     gap="0.25rem"
                     align="center"
                     no-wrap>
                     <Check size="12" class="text-success" />
                     <span>{{ result.metadata.solvedCount }}</span>
                  </StSpace>
                  <StSpace
                     v-if="result.metadata.acceptRate"
                     gap="0.25rem"
                     align="center"
                     no-wrap>
                     <ChartProportion size="12" />
                     <span
                        >{{
                           (result.metadata.acceptRate * 100).toFixed(0)
                        }}%</span
                     >
                  </StSpace>
                  <StSpace
                     v-if="result.metadata.tags.length > 0"
                     gap="0.25rem"
                     no-wrap>
                     <span
                        v-for="tag in result.metadata.tags.slice(0, 2)"
                        :key="tag"
                        class="text-accent-400 whitespace-nowrap">
                        #{{ tag }}
                     </span>
                  </StSpace>
               </template>

               <!-- 用户元数据 -->
               <template v-else-if="result.type === 'user'">
                  <span>{{ result.metadata.role }}</span>
                  <StSpace
                     v-if="result.metadata.solvedProblems"
                     gap="0.25rem"
                     align="center"
                     no-wrap>
                     <Check size="12" class="text-success" />
                     <span>{{ result.metadata.solvedProblems }} 题</span>
                  </StSpace>
               </template>

               <!-- 标签元数据 -->
               <template v-else-if="result.type === 'tag'">
                  <span>{{ result.metadata.problemCount }} 道题目</span>
               </template>

               <!-- 页面板块元数据 -->
               <template v-else-if="result.type === 'page-section'">
                  <span>{{ result.metadata.pageName }}</span>
               </template>

               <!-- 每日一题元数据 -->
               <template v-else-if="result.type === 'daily-problem'">
                  <StSpace gap="0.25rem" align="center" no-wrap>
                     <Time size="12" />
                     <span>{{
                        new Date(result.metadata.date).toLocaleDateString(
                           'zh-CN',
                           { month: 'long', day: 'numeric' }
                        )
                     }}</span>
                  </StSpace>
                  <StSpace
                     v-if="result.metadata.tags.length > 0"
                     gap="0.25rem"
                     no-wrap>
                     <span
                        v-for="tag in result.metadata.tags.slice(0, 2)"
                        :key="tag"
                        class="text-accent-400 whitespace-nowrap">
                        #{{ tag }}
                     </span>
                  </StSpace>
               </template>
            </StSpace>
         </StSpace>
      </StSpace>
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
