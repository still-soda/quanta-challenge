<script setup lang="ts">
defineProps<{
   title: string;
}>();
</script>

<template>
   <StSpace direction="vertical" gap="0.5rem" fill-x>
      <div class="text-accent-200">{{ title }}</div>
      <div class="text-white font-bold w-full">
         <slot></slot>
      </div>
   </StSpace>
</template>
