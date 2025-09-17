<script setup lang="ts">
import MoreOptions from './MoreOptions.vue';
</script>

<template>
   <StCard title="最近学习" class="aspect-square !pb-0 overflow-hidden">
      <template #header-right>
         <MoreOptions />
      </template>

      <StSkeleton loading class="mt-6">
         <template #loading>
            <StSpace direction="vertical" gap="0.75rem">
               <StSkeletonItem rounded="lg" class="w-full h-[5rem]" />
               <StSkeletonItem rounded="lg" class="w-full h-[5rem]" />
               <StSkeletonItem rounded="lg" class="w-full h-[5rem]" />
            </StSpace>
         </template>
      </StSkeleton>

      <div class="bottom-mask w-full h-[4.125rem] absolute bottom-0"></div>
   </StCard>
</template>

<style scoped src="./style.css" />
