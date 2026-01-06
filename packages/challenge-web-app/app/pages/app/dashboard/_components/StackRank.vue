<script setup lang="ts">
import { Lightning } from '@icon-park/vue-next';

const props = defineProps<{
   percent: number;
}>();
</script>

<template>
   <StSpace fill gap="0.25rem" align="end">
      <StSpace
         fill
         direction="vertical"
         align="center"
         class="max-w-8"
         justify="end"
         gap="0.25rem">
         <div
            v-for="i in 10"
            :key="i"
            class="h-[0.1875rem] w-full rounded-md"
            :class="{
               'bg-primary': 10 - i < percent * 10,
               'bg-primary/50': 10 - i >= percent * 10,
            }"></div>
      </StSpace>
      <StSpace direction="vertical" fill class="flex-1">
         <StSpace direction="vertical" gap="0" class="h-[100%]">
            <span class="st-font-tooltip text-primary"> 超过</span>
            <span class="st-font-tooltip text-primary flex items-center">
               {{ (props.percent * 100).toFixed(2) }}%
               <Lightning theme="filled" />
            </span>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
