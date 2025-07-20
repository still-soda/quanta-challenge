<script setup lang="ts">
import * as Icons from '@icon-park/vue-next';

defineProps<{
   icon?: keyof typeof Icons;
   title?: string;
}>();
</script>

<template>
   <div
      class="p-4 rounded-[1.25rem] bg-accent-600 gap-[1.25rem] w-full h-full relative">
      <slot name="header">
         <StSpace justify="between" align="center" class="h-[1.75rem]">
            <slot name="header-left">
               <StSpace gap="0.5rem">
                  <StIcon v-if="icon" :name="icon" class="text-[1.5rem]" />
                  <span class="font-bold">{{ title }}</span>
               </StSpace>
            </slot>
            <slot name="header-right"></slot>
         </StSpace>
      </slot>
      <slot></slot>
   </div>
</template>
