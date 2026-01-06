<script setup lang="ts">
import { TableReport } from '@icon-park/vue-next';

defineProps<{
   title: string;
}>();
</script>

<template>
   <StSpace fill-x gap="0.5rem" align="center">
      <TableReport size="1.25rem" />
      <div class="line-clamp-1 font-bold w-full">{{ title }}</div>
   </StSpace>
</template>
