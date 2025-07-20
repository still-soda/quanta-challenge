<script setup lang="ts">
import MoreOptions from './MoreOptions.vue';
</script>

<template>
   <StCard title="最近提交" class="aspect-square">
      <template #header-right>
         <MoreOptions />
      </template>
      <StSpace direction="vertical" gap="1.25rem" class="mt-6 w-full h-full">
         <StSkeleton loading>
            <template #loading>
               <StSpace gap="1rem">
                  <StSkeletonItem class="h-5 w-full" />
                  <StSkeletonItem class="h-5 w-[2.6875rem]" />
               </StSpace>
            </template>
         </StSkeleton>

         <StSkeleton class="h-full" loading>
            <template #loading>
               <StSpace gap="1rem" class="h-full">
                  <StSkeletonItem class="h-full w-full" />
                  <StSkeletonItem class="h-full w-full" />
               </StSpace>
            </template>
         </StSkeleton>

         <StSkeleton loading>
            <template #loading>
               <StSpace gap="1rem">
                  <StSpace
                     v-for="i in 3"
                     :key="i"
                     direction="vertical"
                     gap="0.5rem"
                     class="w-full">
                     <StSkeletonItem class="h-5 w-full" />
                     <StSkeletonItem class="h-5 w-[3.4rem]" />
                  </StSpace>
               </StSpace>
            </template>
         </StSkeleton>
      </StSpace>
   </StCard>
</template>
