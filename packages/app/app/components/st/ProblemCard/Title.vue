<script setup lang="ts">
defineProps<{
   title: string;
}>();
</script>

<template>
   <StSpace gap="0.5rem" align="center" class="w-full">
      <StIcon name="TableReport" size="1.25rem" />
      <div class="line-clamp-1 font-bold">{{ title }}</div>
   </StSpace>
</template>
