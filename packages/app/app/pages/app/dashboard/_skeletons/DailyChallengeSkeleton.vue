<template>
   <StSkeletonItem rounded="lg" class="p-2 h-fit w-full">
      <StSpace fill-y direction="vertical" gap="0.75rem">
         <StSkeletonItem
            rounded="md"
            :deep="2"
            static
            class="w-full h-[9.44rem]" />
         <StSpace
            fill
            direction="vertical"
            justify="between"
            gap="1rem"
            class="mb-3 px-2">
            <StSkeletonItem static :deep="2" class="w-full h-6" />
            <StSpace gap="0.5rem">
               <StSkeletonItem static :deep="2" class="w-[4.5rem] h-6" />
               <StSkeletonItem static :deep="2" class="w-[3rem] h-6" />
               <StSkeletonItem static :deep="2" class="w-[3rem] h-6" />
            </StSpace>
            <StSpace fill-x gap="0.75rem" class="mt-4">
               <StSpace
                  v-for="i in 3"
                  :key="i"
                  fill-x
                  direction="vertical"
                  gap="0.5rem">
                  <StSkeletonItem static :deep="2" class="w-full h-6" />
                  <StSkeletonItem static :deep="2" class="w-[3.5rem] h-6" />
               </StSpace>
            </StSpace>
         </StSpace>
      </StSpace>
   </StSkeletonItem>
</template>
