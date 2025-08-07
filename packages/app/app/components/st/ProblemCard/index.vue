<script setup lang="ts">
defineProps<{
   coverImageName?: string;
}>();
</script>

<template>
   <StSpace
      direction="vertical"
      gap="0.75rem"
      class="p-2 rounded-xl bg-accent-600 border hover:border-secondary/50 cursor-pointer border-transparent transition-all">
      <img
         :src="`/api/static/${coverImageName}`"
         class="h-[9.76rem] w-full object-cover rounded-lg"
         alt="Cover Image" />
      <StSpace direction="vertical" gap="0.8rem" class="px-2">
         <slot></slot>
      </StSpace>
   </StSpace>
</template>
