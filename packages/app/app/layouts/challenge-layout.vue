<script setup lang="ts"></script>

<template>
   <StSpace direction="vertical" fill gap="0">
      <StHeader>
         <template #left>
            <StSpace gap="0.75rem" align="center">
               <IconLogo class="mx-4" />
               <StHeaderButton class="!px-4">
                  <StIcon name="Return" class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton text="提交记录">
                  <StIcon name="History" class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton text="题目" class="!text-primary">
                  <StIcon name="AlignTextLeftOne" class="text-[1.25rem]" />
               </StHeaderButton>
            </StSpace>
         </template>
         <template #right>
            <StSpace gap="0.75rem" align="center">
               <StHeaderButton text="提交" class="!text-success">
                  <StIcon name="UploadWeb" class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton class="!px-4 !text-warning">
                  <StIcon name="StopwatchStart" class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton class="!px-4">
                  <StIcon name="LayoutFour" class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton class="!px-4">
                  <StIcon name="SettingOne" class="text-[1.25rem]" />
               </StHeaderButton>
               <StAvatar class="w-10 h-10" />
            </StSpace>
         </template>
      </StHeader>
      <slot></slot>
   </StSpace>
</template>
