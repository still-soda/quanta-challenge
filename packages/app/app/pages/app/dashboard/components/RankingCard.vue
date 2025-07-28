<script setup lang="ts">
import MoreOptions from './MoreOptions.vue';
</script>

<template>
   <StCard icon="Ranking" title="我的排名" class="w-full h-full">
      <template #header-right>
         <MoreOptions />
      </template>
      <StSpace direction="vertical" gap="1rem" class="mt-[1.75rem] h-full">
         <StSkeleton loading>
            <template #loading>
               <StSkeletonItem class="h-9 w-[7.125rem]" />
            </template>
         </StSkeleton>
         <StSkeleton loading>
            <template #loading>
               <StSpace gap="1rem" class="w-full">
                  <StSpace direction="vertical" gap="0.5rem" class="w-full">
                     <StSkeletonItem class="h-5 w-[5.375rem]" />
                     <StSkeletonItem class="h-5 w-[3.4375rem]" />
                  </StSpace>
                  <StSpace direction="vertical" gap="0.5rem" class="w-full">
                     <StSkeletonItem class="h-5 w-[5.375rem]" />
                     <StSkeletonItem class="h-5 w-[3.4375rem]" />
                  </StSpace>
               </StSpace>
            </template>
         </StSkeleton>
         <StSkeleton loading class="h-full">
            <template #loading>
               <StSpace direction="vertical" gap="1.25rem" class="h-full">
                  <StSkeletonItem class="w-full h-full" />
                  <StSpace
                     direction="vertical"
                     gap="0.75rem"
                     class="w-full h-full">
                     <StSpace justify="between" class="w-full">
                        <StSkeletonItem class="h-5 w-[5.375rem]" />
                        <StSkeletonItem class="h-5 w-[5rem]" />
                     </StSpace>
                     <StSkeletonItem class="h-full w-full" />
                  </StSpace>
               </StSpace>
            </template>
         </StSkeleton>
      </StSpace>
   </StCard>
</template>
