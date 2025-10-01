<script setup lang="ts">
import { Box } from '@icon-park/vue-next';
import MoreOptions from './MoreOptions.vue';
</script>

<template>
   <StCard title="最近学习" class="aspect-square !pb-0 overflow-hidden">
      <template #header-right>
         <MoreOptions />
      </template>

      <StSkeleton v-if="false" loading class="mt-6">
         <template #loading>
            <StSpace direction="vertical" gap="0.75rem">
               <StSkeletonItem rounded="lg" class="w-full h-[5rem]" />
               <StSkeletonItem rounded="lg" class="w-full h-[5rem]" />
               <StSkeletonItem rounded="lg" class="w-full h-[5rem]" />
            </StSpace>
         </template>
      </StSkeleton>

      <StSpace
         v-else
         fill
         direction="vertical"
         gap="0.75rem"
         align="center"
         justify="center"
         class="text-accent-400 pb-4">
         <Box size="2.625rem" />
         <div class="st-font-body-normal">暂无学习课程</div>
      </StSpace>

      <div class="bottom-mask w-full h-[4.125rem] absolute bottom-0"></div>
   </StCard>
</template>

<style scoped src="../_styles/index.css" />
