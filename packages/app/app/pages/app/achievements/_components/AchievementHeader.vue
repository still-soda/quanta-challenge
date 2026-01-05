<script setup lang="ts">
import dayjs from 'dayjs';

defineProps<{
   title: string;
   achivedAt: string | null;
   score: number;
}>();
</script>

<template>
   <StSpace fill justify="between">
      <StSpace align="center" gap="0.5rem">
         <div class="st-font-body-bold">{{ title }}</div>
         <div
            :class="[
               'st-font-tooltip py-0 px-2 rounded-md font-family-manrope select-none',
               achivedAt
                  ? 'border border-secondary text-secondary'
                  : 'border border-accent-200 text-accent-200',
            ]">
            {{ score }} <span class="italic">pts</span>
         </div>
      </StSpace>
      <div v-if="achivedAt" class="st-font-caption">
         于 {{ dayjs(achivedAt).format('YYYY.MM.DD') }} 获得
      </div>
   </StSpace>
</template>
