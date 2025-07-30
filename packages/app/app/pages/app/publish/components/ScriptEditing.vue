<script setup lang="ts"></script>

<template>
   <StSpace direction="vertical" gap="1rem" class="text-white h-full">
      <StSpace direction="vertical" gap="1.5rem" class="p-6 w-full h-full">
         <!-- Header -->
         <StSpace justify="between" align="end" class="w-full">
            <h1 class="st-font-hero-bold">编辑判题脚本</h1>
            <StButton
               class="py-[0.375rem] px-[0.75rem] text-accent-100 !bg-accent-600">
               <div class="flex gap-2 items-center">
                  <StIcon name="BookOne" class="text-[1.25rem]" />
                  <span class="font-light">查看文档</span>
               </div>
            </StButton>
         </StSpace>
         <main class="flex flex-1 h-full"></main>
      </StSpace>
      <!-- Bottom -->
      <StSpace justify="end" class="p-4 w-full">
         <StButton
            class="py-[0.375rem] px-[1.25rem] text-accent-100 !rounded-[0.375rem]">
            <div class="flex gap-2 items-center">
               <StIcon name="SaveOne" class="text-[1.5rem]" />
               <span>保存</span>
            </div>
         </StButton>
      </StSpace>
   </StSpace>
</template>
