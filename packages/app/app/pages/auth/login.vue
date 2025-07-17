<script setup lang="ts"></script>

<template>
   <div class="w-screen h-screen flex items-center justify-center">
      <div
         class="bg-[#1a1a1a] p-6 pt-8 flex flex-col items-center rounded-r5 gap-6 w-[28.5rem]">
         <IconLogo />
         <div class="flex flex-col items-center gap-r6">
            <h1 class="text-2xl font-bold">欢迎回来</h1>
            <p>
               <span class="text-accent-300">还没有账号？ </span>
               <NuxtLink href="#" class="text-white">注册</NuxtLink>
            </p>
         </div>
         <div class="flex flex-col gap-4 w-full">
            <StInput
               outer-class="bg-accent-700"
               name="email"
               placeholder="请输入邮箱">
               <template #prefix>
                  <StIcon class="text-2xl" name="Mail" />
               </template>
            </StInput>
            <StInput
               outer-class="bg-accent-700"
               placeholder="请输入密码"
               type="password"
               name="password"
               password>
               <template #prefix>
                  <StIcon class="text-2xl" name="Lock" />
               </template>
            </StInput>
            <StButton>登录</StButton>
         </div>
         <StDevider>或者</StDevider>
         <StButton class="!bg-accent-600 !text-accent-200 w-full">
            <div class="flex items-center gap-2">
               <IconQQ />
               使用 QQ 登录
            </div>
         </StButton>
      </div>
   </div>
</template>
