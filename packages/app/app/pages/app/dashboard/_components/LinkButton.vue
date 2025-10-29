<script setup lang="ts">
import { NuxtLink } from '#components';
import { Share } from '@icon-park/vue-next';
import type { DefineComponent } from 'vue';

defineProps<{
   to: string;
   description: string;
   icon?: DefineComponent;
   openInNewTab?: boolean;
}>();
</script>

<template>
   <NuxtLink :to="to" :target="openInNewTab ? '_blank' : '_self'">
      <StPopover placement="left">
         <template #popper="{ triggered }">
            <div
               :class="{ 'translate-x-4': !triggered }"
               class="bg-accent-700 text-accent-100 py-1 px-3 rounded-md transition-all duration-100">
               {{ description }}
            </div>
         </template>
         <StSpace
            gap="0.5rem"
            center
            class="size-8 hover:border-secondary border border-transparent hover:text-secondary transition-colors duration-100 cursor-pointer rounded-full">
            <Component :is="icon ?? Share" />
         </StSpace>
      </StPopover>
   </NuxtLink>
</template>
