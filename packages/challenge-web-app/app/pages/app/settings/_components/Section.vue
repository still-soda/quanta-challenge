<script setup lang="ts">
import type { DefineComponent } from 'vue';

defineProps<{
   title: string;
   desc: string;
   icon: DefineComponent;
}>();
</script>

<template>
   <StSpace fill-x direction="vertical" class="max-w-[55rem]">
      <StSpace align="center" gap="0.75rem">
         <div class="p-3 rounded-full shrink-0 border border-accent-500">
            <component :is="icon" class="text-xl" />
         </div>
         <StSpace direction="vertical" gap="0.2rem">
            <h2 class="text-lg font-bold text-white">{{ title }}</h2>
            <p class="text-sm text-accent-200 leading-relaxed max-w-2xl">
               {{ desc }}
            </p>
         </StSpace>
      </StSpace>

      <slot></slot>
   </StSpace>
</template>
