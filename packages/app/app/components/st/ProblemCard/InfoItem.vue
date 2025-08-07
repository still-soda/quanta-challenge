<script setup lang="ts">
defineProps<{
   title: string;
}>();
</script>

<template>
   <StSpace direction="vertical" gap="0.5rem">
      <div class="text-accent-200">{{ title }}</div>
      <slot></slot>
   </StSpace>
</template>
