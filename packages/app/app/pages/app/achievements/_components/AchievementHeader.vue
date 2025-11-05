<script setup lang="ts">
import dayjs from 'dayjs';

defineProps<{
   title: string;
   achivedAt: string | null;
}>();
</script>

<template>
   <StSpace fill justify="between">
      <div class="st-font-body-bold">{{ title }}</div>
      <div v-if="achivedAt" class="st-font-caption">
         于 {{ dayjs(achivedAt).format('YYYY.MM.DD') }} 获得
      </div>
   </StSpace>
</template>
