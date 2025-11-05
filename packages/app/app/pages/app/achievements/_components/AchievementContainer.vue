<script setup lang="ts">
import { Lock } from '@icon-park/vue-next';

defineProps<{
   imageUrl: string;
   grayscale: boolean;
   locked: boolean;
}>();
</script>

<template>
   <StSpace
      fill-x
      align="center"
      class="!py-[0.875rem] !px-4 rounded-lg bg-accent-600"
      gap="1rem">
      <StSpace
         v-if="locked"
         center
         class="rounded-lg bg-accent-500 text-accent-400 !size-16 shrink-0">
         <Lock size="1.75rem" />
      </StSpace>
      <StImage
         v-else
         :src="imageUrl"
         lazy
         width="4rem"
         height="4rem"
         :class="{ 'grayscale-100': grayscale }" />

      <StSpace
         direction="vertical"
         gap="0.35rem"
         class="pt-[0.25rem] flex-1 min-h-16">
         <slot />
      </StSpace>
   </StSpace>
</template>
