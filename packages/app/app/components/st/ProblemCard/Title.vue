<script setup lang="ts">
import { TableReport } from '@icon-park/vue-next';

defineProps<{
   title: string;
}>();
</script>

<template>
   <StSpace gap="0.5rem" align="center" class="w-full">
      <TableReport size="1.25rem" />
      <div class="line-clamp-1 font-bold">{{ title }}</div>
   </StSpace>
</template>
