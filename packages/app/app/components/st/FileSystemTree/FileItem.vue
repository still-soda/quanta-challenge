<script setup lang="ts">
import type { FileSystemItem } from './type';

const props = defineProps<{
   file: FileSystemItem;
   deep: number;
   selected?: boolean;
}>();
</script>

<template>
   <div
      :style="{ paddingLeft: `${props.deep * 1 + 0.5}rem` }"
      class="flex items-center gap-1 font-family-fira-code min-w-fit w-full py-0.5 px-2 hover:cursor-pointer hover:bg-accent-600"
      :class="{ 'bg-accent-600': props.selected }">
      <StIcon theme="filled" name="FileCode" size="1rem" />
      <div class="text-sm text-nowrap whitespace-nowrap">{{ file.name }}</div>
   </div>
</template>
