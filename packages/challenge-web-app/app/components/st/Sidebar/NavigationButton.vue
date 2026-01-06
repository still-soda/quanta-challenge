<script setup lang="ts">
defineProps<{
   to?: string;
}>();
</script>

<template>
   <NuxtLink
      :to="to"
      :class="[
         'size-[3.5rem] flex shrink-0 items-center justify-center rounded-full',
         'bg-accent-600 text-white hover:bg-accent-500 transition-colors',
      ]">
      <slot></slot>
   </NuxtLink>
</template>
