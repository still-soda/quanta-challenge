<script setup lang="ts">
defineProps<{
   loading?: boolean;
}>();
</script>

<template>
   <div
      :class="{ 'animate-pulse': loading }"
      class="size-4 rounded-sm bg-accent-500 shrink-0 flex items-center justify-center"></div>
</template>
