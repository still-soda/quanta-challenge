<script setup lang="ts">
import { ErrorPicture } from '@icon-park/vue-next';

const props = defineProps<{
   coverImageName?: string;
}>();

const imageSrc = computed(() =>
   props.coverImageName ? `/api/static/${props.coverImageName}` : ''
);
</script>

<template>
   <StSpace
      fill-x
      direction="vertical"
      gap="0.75rem"
      class="p-2 rounded-xl bg-accent-600 border hover:border-secondary/50 cursor-pointer border-transparent transition-all">
      <StImage :src="imageSrc" height="9.76rem" alt="Cover Image">
         <template #fallback="{ style }">
            <StSpace
               fill
               center
               class="rounded-lg bg-accent-600/75 text-accent-500"
               :style="style">
               <ErrorPicture size="2rem" />
            </StSpace>
         </template>
      </StImage>
      <StSpace fill-x direction="vertical" gap="0.8rem" class="px-2">
         <slot></slot>
      </StSpace>
   </StSpace>
</template>
