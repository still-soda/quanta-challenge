<script setup lang="ts">
defineProps<{
   text?: string;
}>();
</script>

<template>
   <button
      :class="[
         'px-6 py-4 rounded-full bg-accent-600 text-white',
         'hover:opacity-80 transition-opacity hover:cursor-pointer',
      ]">
      <StSpace gap=".75rem" align="center">
         <slot></slot>
         <span v-if="text" class="font-bold text-nowrap whitespace-nowrap">
            {{ text }}
         </span>
      </StSpace>
   </button>
</template>
