<script setup lang="ts">
import { Close } from '@icon-park/vue-next';

const props = defineProps<{
   title?: string;
   closable?: boolean;
}>();

defineEmits(['close']);
</script>

<template>
   <StSpace
      direction="vertical"
      gap="1.25rem"
      class="bg-accent-600 rounded-xl shadow-lg shadow-background size-fit p-5 relative">
      <slot name="header">
         <button
            v-if="props.closable"
            @click="$emit('close')"
            class="absolute outline-none border-none text-accent-300 right-5 top-5.5 cursor-pointer">
            <Close size="1.25rem" />
         </button>
         <StSpace
            v-if="props.title"
            fill-x
            justify="center"
            class="text-white st-font-body-bold">
            {{ props.title }}
         </StSpace>
      </slot>
      <slot></slot>
   </StSpace>
</template>
