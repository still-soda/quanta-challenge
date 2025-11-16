<template>
   <StSpace fill-x direction="vertical" gap="0.5rem" class="ml-2">
      <StSpace v-for="i in 4" :key="i" fill gap="0.5rem" class="relative">
         <StSpace
            fill-y
            direction="vertical"
            align="center"
            gap="0.5rem"
            class="absolute">
            <StSkeletonItem :deep="1" class="size-5 rounded-full" />
            <StSkeletonItem :deep="1" :class="['w-[1px] flex-1 opacity-50']" />
         </StSpace>
         <StSpace fill-x direction="vertical" gap="0.5rem" class="ml-6 pb-2">
            <StSkeletonItem :deep="1" class="h-4 w-4/5 rounded" />
            <StSkeletonItem :deep="1" class="h-4 w-3/5 rounded" />
            <StSpace fill-x gap="0.5rem">
               <StSkeletonItem
                  :deep="1"
                  class="h-[10rem] w-[15rem] rounded-sm" />
            </StSpace>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
