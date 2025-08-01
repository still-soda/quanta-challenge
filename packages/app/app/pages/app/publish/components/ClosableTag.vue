<script setup lang="ts">
defineProps<{
   content: string;
   color?: string;
}>();

defineEmits(['close']);
</script>

<template>
   <StSpace
      align="center"
      no-wrap
      gap="0.375rem"
      class="pl-[0.875rem] pr-2 py-[0.25rem] rounded-[0.375rem] bg-primary w-fit text-white hover:cursor-auto">
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
