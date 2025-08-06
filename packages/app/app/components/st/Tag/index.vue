<script setup lang="ts">
const props = defineProps<{
   content: string;
   color?: string;
   closable?: boolean;
   size?: 'small' | 'base';
}>();

defineEmits(['close']);

const textColorClass = computed(() => {
   return shouldUseBlackText(props.color ?? '#FA7C0E')
      ? 'text-accent-700'
      : 'text-white';
});

const size = computed(() => props.size ?? 'base');
</script>

<template>
   <StSpace
      align="center"
      no-wrap
      gap="0.375rem"
      :style="{ backgroundColor: color || '#FA7C0E' }"
      :class="[
         textColorClass,
         {
            'pl-[0.875rem] pr-2 py-[0.25rem]': size === 'base',
            'px-[0.5rem] py-[0.25rem]': size === 'small',
         },
      ]"
      class="rounded-[0.375rem] w-fit hover:cursor-auto">
      <span :class="[size === 'base' ? 'text-[0.875rem]' : 'text-[0.625rem]']">
         {{ content }}
      </span>
      <StSpace
         v-if="closable"
         center
         no-shrink
         @click="$emit('close')"
         class="size-5 rounded-full hover:bg-white/20 hover:cursor-pointer">
         <StIcon name="CloseSmall" />
      </StSpace>
   </StSpace>
</template>
