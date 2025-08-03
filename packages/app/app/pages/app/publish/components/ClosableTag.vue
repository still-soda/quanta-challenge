<script setup lang="ts">
const props = defineProps<{
   content: string;
   color?: string;
}>();

defineEmits(['close']);

const textColorClass = computed(() => {
   return shouldUseBlackText(props.color ?? '#FA7C0E')
      ? 'text-accent-700'
      : 'text-white';
});
</script>

<template>
   <StSpace
      align="center"
      no-wrap
      gap="0.375rem"
      :style="{ backgroundColor: color || '#FA7C0E' }"
      :class="textColorClass"
      class="pl-[0.875rem] pr-2 py-[0.25rem] rounded-[0.375rem] w-fit hover:cursor-auto">
      <span class="text-[0.875rem]">{{ content }}</span>
      <StSpace
         center
         no-shrink
         @click="$emit('close')"
         class="size-5 rounded-full hover:bg-white/20 hover:cursor-pointer">
         <StIcon name="CloseSmall" />
      </StSpace>
   </StSpace>
</template>
