<script setup lang="ts">
import type { ISlideRadioGroupOption } from './type';

const props = defineProps<{
   option: ISlideRadioGroupOption;
   selected?: boolean;
}>();

const textColor = computed(() => {
   return shouldUseBlackText(props.option.color)
      ? '!text-accent-700'
      : 'text-white';
});
</script>

<template>
   <div
      class="w-full flex justify-center py-3 rounded-[0.25rem] transition-all"
      :class="[
         {
            'hover:bg-accent-600 hover:cursor-pointer': !selected,
            'font-bold': selected,
         },
         selected && textColor,
      ]">
      {{ option.label }}
   </div>
</template>
