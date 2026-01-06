<template>
   <div class="h-[3.125rem] w-full flex items-center">
      <StSkeletonItem class="h-6 w-[16rem]" />
   </div>
   <StSpace direction="vertical" gap="1rem" class="w-full h-full">
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
