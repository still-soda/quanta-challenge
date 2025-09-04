<template>
   <StSpace
      class="w-[34rem] min-h-full absolute top-0 left-0"
      gap="0.75rem"
      direction="vertical">
      <StSpace
         fill-x
         class="py-4 px-5 rounded-[0.375rem]"
         direction="vertical"
         gap="1.5rem">
         <StSpace fill-x gap="0.5rem" align="center" class="mb-2">
            <StSkeletonItem
               :deep="2"
               class="w-[4rem] h-[1.25rem] rounded-[0.25rem]" />
            <StSkeletonItem
               :deep="2"
               class="w-[8.375rem] h-[1.25rem] rounded-[0.25rem]" />
         </StSpace>
         <StSpace fill-x align="center" gap="0.75rem">
            <StSkeletonItem :deep="2" class="size-8 rounded-full shrink-0" />
            <StSkeletonItem
               :deep="2"
               class="w-full h-[1.25rem] rounded-[0.25rem]" />
         </StSpace>
         <StSpace fill-x gap="1.5rem">
            <StSpace v-for="i in 4" :key="i" direction="vertical" gap="0.5rem">
               <StSkeletonItem
                  :deep="2"
                  class="w-[6.375rem] h-[1.25rem] rounded-[0.25rem]" />
               <StSkeletonItem
                  :deep="2"
                  class="w-[3.375rem] h-[1.25rem] rounded-[0.25rem]" />
            </StSpace>
         </StSpace>
         <StSkeletonItem
            :deep="2"
            class="w-full h-[0.0625rem] rounded-[0.25rem]" />
         <StSpace fill-x gap="0.75rem" direction="vertical">
            <StSkeletonItem
               :deep="2"
               class="w-[17rem] h-[1.25rem] rounded-[0.25rem]" />
            <StSkeletonItem
               :deep="2"
               class="w-full h-[17rem] rounded-[0.25rem]" />
         </StSpace>
         <StSkeletonItem
            :deep="2"
            class="w-full h-[0.0625rem] rounded-[0.25rem]" />
         <StSpace fill-x direction="vertical" gap="1rem">
            <StSkeletonItem
               :deep="2"
               class="w-[5.25rem] h-[1.25rem] rounded-[0.25rem]" />
            <StSpace fill-x class="px-4" gap="0.75rem" direction="vertical">
               <StSkeletonItem
                  :deep="2"
                  class="w-[22.4rem] h-[1.25rem] rounded-[0.25rem]" />
               <StSkeletonItem
                  :deep="2"
                  class="w-[11rem] h-[5.68rem] rounded-[0.25rem]" />
               <StSkeletonItem
                  :deep="2"
                  class="w-[18.1875rem] h-[1.25rem] rounded-[0.25rem]" />
               <StSkeletonItem
                  :deep="2"
                  class="w-[25.25rem] h-[1.25rem] rounded-[0.25rem]" />
               <StSkeletonItem
                  :deep="2"
                  class="w-[11rem] h-[5.68rem] rounded-[0.25rem]" />
               <StSkeletonItem
                  :deep="2"
                  class="w-[25.25rem] h-[1.25rem] rounded-[0.25rem]" />
            </StSpace>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
