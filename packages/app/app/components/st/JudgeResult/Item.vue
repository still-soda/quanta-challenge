<script setup lang="ts">
import { CheckOne, CloseOne } from '@icon-park/vue-next';
import type { JudgeResults } from './type';

const props = defineProps<{
   data: JudgeResults[number];
   isLast?: boolean;
}>();

const fileUrls = computed(() => {
   const results: [string, string][] = [];
   Object.entries(props.data.cacheFiles).forEach(([name, url]) => {
      results.push([name, `/api/static/${url}`]);
   });
   return results;
});

const textColorClass = computed(() => {
   return props.data.status === 'pass' ? 'text-success' : 'text-error';
});
const bgColorClass = computed(() => {
   return props.data.status === 'pass' ? 'bg-success' : 'bg-error';
});
const icon = computed(() => {
   return props.data.status === 'pass' ? CheckOne : CloseOne;
});
</script>

<template>
   <StSpace fill gap="0.5rem" class="relative">
      <StSpace
         fill-y
         direction="vertical"
         align="center"
         gap="0.5rem"
         class="absolute">
         <Component :is="icon" :class="textColorClass" />
         <div
            v-if="!props.isLast"
            :class="['w-[1px] flex-1 opacity-50', bgColorClass]"></div>
      </StSpace>
      <StSpace fill-x direction="vertical" gap="0.5rem" class="ml-6 pb-2">
         <div class="font-normal text-xs text-white">
            {{ data.details }}
         </div>
         <StSpace fill-x gap="0.5rem">
            <img
               v-for="([name, url], idx) in fileUrls"
               class="h-[15rem] rounded-sm"
               :key="idx"
               :src="url"
               :alt="name"
               :title="name" />
         </StSpace>
      </StSpace>
   </StSpace>
</template>
