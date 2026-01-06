<script setup lang="ts">
import { Close, Left, Right, Calendar } from '@icon-park/vue-next';

import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~~/server/trpc/routes';
type RouterOutput = inferRouterOutputs<AppRouter>;
type Notification =
   RouterOutput['protected']['notification']['list']['items'][number];

const props = defineProps<{
   notification: Notification | null;
   hasPrevious?: boolean;
   hasNext?: boolean;
}>();

const emit = defineEmits(['prev', 'next']);
const opened = defineModel<boolean>('opened');

const close = () => {
   opened.value = false;
};

const formattedTime = computed(() => {
   if (!props.notification) return '';
   return new Date(props.notification.createdAt).toLocaleString();
});

const handleKeydown = (e: KeyboardEvent) => {
   if (!opened.value) return;
   if (e.key === 'ArrowLeft' && props.hasPrevious) {
      emit('prev');
   } else if (e.key === 'ArrowRight' && props.hasNext) {
      emit('next');
   } else if (e.key === 'Escape') {
      close();
   }
};

onMounted(() => {
   window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
   window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
   <StModal v-model:opened="opened">
      <div
         v-if="notification"
         class="w-[50rem] max-w-[95vw] h-[36rem] max-h-[85vh] bg-accent-700 rounded-xl flex flex-col relative shadow-2xl border border-accent-600 overflow-hidden">
         <!-- Top Decoration Line -->
         <div class="h-1 w-full bg-secondary"></div>

         <!-- Header Area -->
         <div class="px-10 pt-10 pb-6 shrink-0 bg-accent-700 z-10">
            <div class="flex justify-between items-start mb-4">
               <div class="flex items-center gap-3">
                  <span
                     class="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-accent-600 text-accent-200 border border-accent-500">
                     {{ notification.type }}
                  </span>
                  <div
                     class="flex items-center gap-1.5 text-accent-400 text-sm">
                     <Calendar size="14" />
                     <span>{{ formattedTime }}</span>
                  </div>
               </div>
               <div
                  @click="close"
                  class="text-accent-400 hover:text-white transition-colors cursor-pointer p-2 -mr-2 -mt-2 hover:bg-accent-600 rounded-lg">
                  <Close size="1.5rem" />
               </div>
            </div>
            <h2
               class="text-3xl font-bold text-white leading-tight tracking-tight font-family-manrope">
               {{ notification.title }}
            </h2>
         </div>

         <!-- Content Area -->
         <div class="flex-1 overflow-y-auto px-10 pb-8 custom-scrollbar">
            <div class="prose prose-invert max-w-none">
               <p
                  class="text-lg text-accent-200 leading-relaxed whitespace-pre-wrap">
                  {{ notification.content }}
               </p>
            </div>
         </div>

         <!-- Footer Navigation -->
         <div
            class="px-10 py-6 bg-accent-800 border-t border-accent-600 flex justify-between items-center shrink-0">
            <button
               @click="$emit('prev')"
               :disabled="!hasPrevious"
               class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all group"
               :class="
                  hasPrevious
                     ? 'text-accent-200 hover:text-white hover:bg-accent-600 cursor-pointer'
                     : 'text-accent-600 cursor-not-allowed'
               ">
               <Left
                  size="1.25rem"
                  class="group-hover:-translate-x-1 transition-transform" />
               <span class="font-bold">上一条</span>
            </button>

            <div
               class="text-accent-500 text-xs font-medium select-none flex items-center gap-4">
               <div class="flex items-center gap-1.5">
                  <kbd
                     class="px-1.5 py-0.5 bg-accent-700 rounded border border-accent-600 text-[0.625rem]">
                     Esc
                  </kbd>
                  <span>关闭</span>
               </div>
               <div class="flex items-center gap-1.5">
                  <kbd
                     class="px-1.5 py-0.5 bg-accent-700 rounded border border-accent-600 text-[0.625rem]">
                     ←
                  </kbd>
                  <kbd
                     class="px-1.5 py-0.5 bg-accent-700 rounded border border-accent-600 text-[0.625rem]">
                     →
                  </kbd>
                  <span>切换</span>
               </div>
            </div>

            <button
               @click="$emit('next')"
               :disabled="!hasNext"
               class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all group"
               :class="
                  hasNext
                     ? 'text-accent-200 hover:text-white hover:bg-accent-600 cursor-pointer'
                     : 'text-accent-600 cursor-not-allowed'
               ">
               <span class="font-bold">下一条</span>
               <Right
                  size="1.25rem"
                  class="group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>
   </StModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
   width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
   background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
   background-color: #4b5563;
   border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
   background-color: #6b7280;
}
</style>
