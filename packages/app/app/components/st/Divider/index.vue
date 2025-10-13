<script setup lang="ts">
defineProps<{
   simple?: boolean;
}>();
</script>

<template>
   <div class="w-full relative flex items-center justify-center h-fit">
      <div class="h-[1px] bg-accent-400 w-full"></div>
      <div
         v-if="!simple"
         class="text-sm text-accent-200 font-light px-4 text-nowrap whitespace-nowrap">
         <slot></slot>
      </div>
      <div class="h-[1px] bg-accent-400 w-full"></div>
   </div>
</template>
