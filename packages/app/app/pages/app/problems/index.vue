<script setup lang="ts"></script>

<template>
   <StSpace direction="vertical" align="center" gap="0" class="h-full">
      <StHeader>
         <template #left>
            <StSpace gap="0.75rem" align="center">
               <StHeaderButton text="搜索">
                  <StIcon name="Search" class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton text="通知">
                  <StIcon name="Remind" class="text-[1.25rem]" />
               </StHeaderButton>
            </StSpace>
         </template>
         <template #right>
            <StHeaderProfile name="没有气的汽水" desc="20th前端CEO" />
         </template>
      </StHeader>
   </StSpace>
</template>
