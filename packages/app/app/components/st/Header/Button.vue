<script setup lang="ts">
const props = defineProps<{
   text?: string;
   class?: any;
}>();
</script>

<template>
   <button
      :class="[
         'px-6 py-4 rounded-full bg-accent-600 text-white',
         'hover:opacity-80 transition-opacity hover:cursor-pointer',
         props.class,
      ]">
      <StSpace gap=".75rem" align="center">
         <slot></slot>
         <span v-if="text" class="font-bold text-nowrap whitespace-nowrap">
            {{ text }}
         </span>
      </StSpace>
   </button>
</template>
