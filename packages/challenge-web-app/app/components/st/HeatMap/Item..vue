<script setup lang="ts">
defineProps<{
   loading?: boolean;
   count: number;
}>();
</script>

<template>
   <div
      v-if="count < 12 || typeof count === 'undefined'"
      :class="{ 'animate-pulse': loading }"
      class="size-4 rounded-sm bg-accent-500 shrink-0 flex items-center justify-center">
      <div
         v-if="count"
         class="rounded-full bg-primary"
         :class="{
            'size-[0.375rem]': count < 4,
            'size-[0.5rem]': count >= 4 && count < 8,
            'size-[0.75rem]': count >= 8,
         }"></div>
   </div>
   <div v-else class="size-4 rounded-full bg-primary"></div>
</template>
