<script setup lang="ts">
import { Calendar } from '@icon-park/vue-next';
import DailyChallengeSkeleton from '../_skeletons/DailyChallengeSkeleton.vue';
</script>

<template>
   <StCard :icon="Calendar" class="h-full" title="每日一题">
      <StSpace class="w-full h-full mt-5">
         <StSpace direction="vertical" gap="1rem" class="w-full h-full">
            <StDateIndicator class="w-full" />
            <div class="flex flex-1 min-h-0 overflow-hidden w-full relative">
               <DailyChallengeSkeleton class="absolute" />
            </div>
            <div
               class="bottom-mask w-[calc(100%-2rem)] h-[4.125rem] absolute bottom-0"></div>
         </StSpace>
         <StSpace
            direction="vertical"
            gap="1rem"
            class="w-full h-[calc(100%-3.25rem)]">
            <StSkeleton loading class="h-full">
               <template #loading>
                  <div class="h-[3.125rem] w-full flex items-center">
                     <StSkeletonItem class="h-6 w-[16rem]" />
                  </div>
                  <StSpace
                     direction="vertical"
                     gap="1rem"
                     class="w-full h-full">
                     <StSkeletonItem class="h-6 w-[9.6rem]" />
                     <StSkeletonItem class="h-[6rem] w-full" />
                     <StSpace
                        direction="vertical"
                        justify="end"
                        gap="0.625rem"
                        class="w-full h-full flex-1">
                        <StSkeletonItem class="h-6 w-[9.6rem]" />
                        <StSkeletonItem class="h-9 w-full" />
                     </StSpace>
                  </StSpace>
               </template>
            </StSkeleton>
         </StSpace>
      </StSpace>
   </StCard>
</template>

<style scoped src="../_styles/index.css" />
