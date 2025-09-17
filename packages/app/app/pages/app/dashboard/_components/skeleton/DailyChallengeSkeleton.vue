<script setup lang="ts"></script>

<template>
   <StSkeleton loading class="h-full">
      <template #loading>
         <StSkeletonItem rounded="lg" class="p-2 h-fit">
            <StSpace direction="vertical" gap="0.75rem" class="h-full">
               <StSkeletonItem
                  rounded="md"
                  :deep="2"
                  static
                  class="w-full h-[9.44rem]" />
               <StSpace
                  direction="vertical"
                  justify="between"
                  gap="1rem"
                  class="w-full h-full mb-3 px-2">
                  <StSkeletonItem static :deep="2" class="w-full h-6" />
                  <StSpace gap="0.5rem">
                     <StSkeletonItem static :deep="2" class="w-[4.5rem] h-6" />
                     <StSkeletonItem static :deep="2" class="w-[3rem] h-6" />
                     <StSkeletonItem static :deep="2" class="w-[3rem] h-6" />
                  </StSpace>
                  <StSpace gap="0.75rem" class="w-full">
                     <StSpace
                        v-for="i in 3"
                        :key="i"
                        direction="vertical"
                        gap="0.5rem"
                        class="w-full">
                        <StSkeletonItem static :deep="2" class="w-full h-6" />
                        <StSkeletonItem
                           static
                           :deep="2"
                           class="w-[3.5rem] h-6" />
                     </StSpace>
                  </StSpace>
               </StSpace>
            </StSpace>
         </StSkeletonItem>
      </template>
      <slot></slot>
   </StSkeleton>
</template>
