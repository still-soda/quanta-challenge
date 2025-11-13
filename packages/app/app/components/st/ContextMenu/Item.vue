<script setup lang="ts">
import type { DefineComponent } from 'vue';

defineProps<{
   icon?: DefineComponent;
   disabled?: boolean;
}>();

defineEmits<{
   (e: 'action'): void;
}>();
</script>

<template>
   <StSpace
      fill-x
      justify="between"
      gap="0.5rem"
      align="center"
      class="px-2 py-1 rounded-sm text-sm bg-transparent"
      :class="{
         'hover:bg-accent-600 hover:cursor-pointer': !disabled,
         'opacity-50 cursor-not-allowed': disabled,
      }"
      @click="!disabled && $emit('action')">
      <StSpace gap="0.5rem" align="center">
         <slot name="prefix">
            <Component v-if="icon" :is="icon" class="text-sm" />
         </slot>
         <slot></slot>
      </StSpace>
      <slot name="suffix"></slot>
   </StSpace>
</template>
