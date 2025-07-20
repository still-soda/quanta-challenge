<script setup lang="ts">
const props = defineProps<{
   deep?: 1 | 2;
   rounded?: 'sm' | 'md' | 'lg';
   static?: boolean;
}>();

const deep = computed(() => props.deep ?? 1);
const rounded = computed(() => props.rounded ?? 'sm');
</script>

<template>
   <div
      :class="{
         'animate-pulse': !static,
         'bg-accent-500': deep === 1,
         'bg-accent-600': deep === 2,
         'rounded-[0.25rem]': rounded === 'sm',
         'rounded-[0.5rem]': rounded === 'md',
         'rounded-[0.75rem]': rounded === 'lg',
      }">
      <slot></slot>
   </div>
</template>
