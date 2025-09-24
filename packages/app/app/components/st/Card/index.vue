<script setup lang="ts">
import type { DefineComponent } from 'vue';

defineProps<{
   icon?: DefineComponent;
   title?: string;
   bordered?: boolean;
}>();
</script>

<template>
   <div
      class="p-4 rounded-[1.25rem] bg-accent-600 ring ring-transparent w-full h-full relative flex flex-col">
      <slot name="header">
         <StSpace justify="between" align="center" class="h-[1.75rem]">
            <slot name="header-left">
               <StSpace gap="0.5rem">
                  <Component
                     v-if="icon"
                     :is="icon"
                     class="text-[1.5rem]"></Component>
                  <span class="font-bold">{{ title }}</span>
               </StSpace>
            </slot>
            <slot name="header-right"></slot>
         </StSpace>
      </slot>
      <slot></slot>
   </div>
</template>
