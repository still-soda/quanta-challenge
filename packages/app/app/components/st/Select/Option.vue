<script setup lang="ts">
import { TOGGLE_OPTION_INJECT_KEY, type ToggleOption } from './type';

const toggleOption = inject<ToggleOption>(
   TOGGLE_OPTION_INJECT_KEY,
   () => void 0
);

if (!toggleOption) {
   throw new Error(
      'Toggle option function is not provided. Make sure to use this component within a Select context.'
   );
}

defineProps<{
   value: any;
   selected?: boolean;
}>();
</script>

<template>
   <div
      @click="toggleOption(value)"
      class="w-full px-2 py-2 rounded-sm hover:cursor-pointer hover:bg-accent-600 transition-colors"
      :class="{ 'bg-accent-600': selected }">
      <slot></slot>
   </div>
</template>
