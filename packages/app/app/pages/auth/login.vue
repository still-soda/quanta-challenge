<script setup lang="ts">
import { useLogin } from '~/composables/auth/use-login';
import type { IRule } from '../../components/st/Form/type';
import z from 'zod';

const { formdata, formKey, loading, handleLogin } = useLogin();

const rules: IRule[] = [
   {
      name: 'email',
      required: true,
      validator: (value: string) => z.email().safeParse(value).success,
   },
   {
      name: 'password',
      required: true,
      validator: (value: string) => value.length >= 6,
   },
];
</script>

<template>
   <div class="w-screen h-screen flex items-center justify-center">
      <div
         class="bg-[#1a1a1a] p-6 pt-8 flex flex-col items-center rounded-r5 gap-6 w-[28.5rem]">
         <IconLogo />
         <div class="flex flex-col items-center gap-r6">
            <h1 class="text-2xl font-bold">欢迎回来</h1>
            <p>
               <span class="text-accent-300">还没有账号？ </span>
               <NuxtLink href="/auth/register" class="text-white">
                  注册
               </NuxtLink>
            </p>
         </div>
         <StForm
            :ref="formKey"
            @keydown.enter.prevent="handleLogin"
            v-model:model-value="formdata"
            :rules="rules"
            class="flex flex-col gap-4 w-full">
            <StFormItem name="email" error-message="请输入有效的邮箱地址">
               <StInput
                  v-model:value="formdata.email"
                  outer-class="bg-accent-700"
                  placeholder="请输入邮箱">
                  <template #prefix>
                     <StIcon class="text-2xl" name="Mail" />
                  </template>
               </StInput>
            </StFormItem>
            <StFormItem name="password" error-message="密码至少需要6个字符">
               <StInput
                  v-model:value="formdata.password"
                  outer-class="bg-accent-700"
                  placeholder="请输入密码"
                  type="password"
                  name="password"
                  password>
                  <template #prefix>
                     <StIcon class="text-2xl" name="Lock" />
                  </template>
               </StInput>
            </StFormItem>
            <StButton :loading @click.prevent="handleLogin">登录</StButton>
         </StForm>
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
