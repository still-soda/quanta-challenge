<script setup lang="ts">
defineProps<{
   title: string;
   center?: boolean;
}>();
</script>

<template>
   <StSpace
      direction="vertical"
      gap="0.5rem"
      class="text-nowrap whitespace-nowrap"
      :center>
      <div class="text-accent-200">{{ title }}</div>
      <slot></slot>
   </StSpace>
</template>
