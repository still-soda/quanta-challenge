<script setup lang="ts">
import { FiveStarBadge } from '@icon-park/vue-next';
import MoreOptions from './MoreOptions.vue';
</script>

<template>
   <StCard
      :icon="FiveStarBadge"
      title="徽章墙"
      class="w-full h-full !pb-0 overflow-hidden">
      <template #header-right>
         <MoreOptions />
      </template>
      <div class="w-full h-full relative">
         <StSkeleton loading class="w-full h-full mt-5 absolute top-0">
            <template #loading>
               <StSpace direction="vertical" gap="0.75rem">
                  <StSkeletonItem
                     v-for="i in 8"
                     :key="i"
                     class="w-full h-20"
                     rounded="lg" />
               </StSpace>
            </template>
         </StSkeleton>

         <div class="bottom-mask w-full h-[3rem] absolute bottom-0"></div>
      </div>
   </StCard>
</template>

<style scoped src="./style.css" />
