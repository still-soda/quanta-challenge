<script setup lang="ts">
defineProps<{
   count: number;
}>();
</script>

<template>
   <StSpace gap="0.5rem">
      <StSkeletonItem
         v-for="i in count"
         :key="i"
         class="h-[1.625rem] w-[5rem] rounded-[0.375rem] bg-accent-500" />
   </StSpace>
</template>
