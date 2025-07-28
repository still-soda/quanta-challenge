<script setup lang="ts"></script>

<template>
   <StSpace direction="vertical" align="center" gap="0" class="h-full">
      <StSpace
         direction="vertical"
         class="mt-6 h-full overflow-scroll hide-scrollbar">
         <h1 class="text-[2.5rem] font-bold text-white">题目</h1>
         <StSkeleton loading class="mt-4">
            <template #loading>
               <StSpace gap="0.75rem">
                  <StSkeletonItem
                     v-for="i in 3"
                     :key="i"
                     class="h-[3.5rem] w-32 !rounded-full" />
               </StSpace>
            </template>
         </StSkeleton>
         <div class="w-full h-[1px] shrink-0 bg-accent-600"></div>
         <StSkeleton loading class="w-full h-full">
            <template #loading>
               <div class="grid grid-cols-4 gap-5 w-full h-full">
                  <StSkeletonItem
                     v-for="i in 12"
                     :key="i"
                     class="w-[14rem] h-[20rem]"
                     rounded="lg" />
               </div>
            </template>
         </StSkeleton>
      </StSpace>
   </StSpace>
</template>

<style scoped src="@/assets/css/utils.css" />
