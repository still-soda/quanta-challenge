<script setup lang="ts">
import type { DefineComponent } from 'vue';

defineProps<{
   icon?: DefineComponent;
}>();
</script>

<template>
   <StSpace
      fill-x
      justify="between"
      gap="0.5rem"
      align="center"
      class="px-2 py-1 rounded-sm text-sm bg-transparent hover:bg-accent-600 cursor-pointer">
      <StSpace gap="0.5rem" align="center">
         <slot name="prefix">
            <Component v-if="icon" :is="icon" class="text-sm" />
         </slot>
         <slot></slot>
      </StSpace>
      <slot name="suffix"></slot>
   </StSpace>
</template>
