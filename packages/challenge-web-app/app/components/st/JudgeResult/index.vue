<script setup lang="ts">
import type { JudgeResults } from './type';

defineProps<{
   judgeResult: JudgeResults;
}>();
</script>

<template>
   <StSpace fill direction="vertical" gap="0.5rem" class="ml-2">
      <StJudgeResultItem
         v-for="(item, idx) in judgeResult"
         :key="idx"
         :data="item"
         :is-last="idx === judgeResult.length - 1" />
   </StSpace>
</template>
