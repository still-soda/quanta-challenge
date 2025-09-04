<script setup lang="ts">
import type { IProgressStep } from './type';

const props = defineProps<{
   direction: 'vertical' | 'horizontal';
   steps: IProgressStep[];
}>();
</script>

<template>
   <StSpace
      fill-x
      gap="0.375rem"
      :direction="props.direction"
      justify="between">
      <StProgressStep
         v-for="(step, idx) in props.steps"
         :key="idx"
         :step="step"
         :direction="props.direction"
         :isLast="idx === props.steps.length - 1" />
   </StSpace>
</template>
