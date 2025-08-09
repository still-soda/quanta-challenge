<script setup lang="ts">
import z from 'zod';
import type { IRule } from '~/components/st/Form/type';
import { useRegister } from '~/composables/auth/use-register';

const { formdata, formKey, loading, handleRegister } = useRegister();

const rules: IRule[] = [
   {
      name: 'username',
      required: true,
      validator: (value: string) => value.length >= 3,
   },
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
   {
      name: 'confirmPassword',
      required: true,
      validator: (value: string) => value === formdata.password,
   },
];

const getStatus = (
   prop: keyof typeof formdata,
   idx: number
): 'success' | 'error' | 'default' => {
   if (!formdata[prop] || !rules[idx]?.validator) return 'default';
   return rules[idx].validator(formdata[prop]) ? 'success' : 'error';
};
</script>

<template>
   <div class="w-screen h-screen flex items-center justify-center">
      <div
         class="bg-[#1a1a1a] p-6 pt-8 flex flex-col items-center rounded-r5 gap-6 w-[28.5rem]">
         <IconLogo />
         <div class="flex flex-col items-center gap-r6">
            <h1 class="text-2xl font-bold">开启你的旅程</h1>
            <p>
               <span class="text-accent-300">已经有账号？ </span>
               <NuxtLink href="/auth/login" class="text-white"> 登录 </NuxtLink>
            </p>
         </div>
         <StForm
            :ref="formKey"
            :rules="rules"
            @keydown.enter.prevent="handleRegister"
            v-model:model-value="formdata"
            class="flex flex-col gap-4 w-full">
            <StFormItem name="username" error-message="用户名至少需要3个字符">
               <StInput
                  :status="getStatus('username', 0)"
                  v-model:value="formdata.username"
                  outer-class="bg-accent-700"
                  placeholder="请输入用户名">
                  <template #prefix>
                     <StIcon class="text-2xl" name="User" />
                  </template>
               </StInput>
            </StFormItem>
            <StFormItem name="email" error-message="请输入有效的邮箱地址">
               <StInput
                  :status="getStatus('email', 1)"
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
                  :status="getStatus('password', 2)"
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
            <StFormItem
               name="confirmPassword"
               error-message="两次输入的密码不一致">
               <StInput
                  :status="getStatus('confirmPassword', 3)"
                  v-model:value="formdata.confirmPassword"
                  outer-class="bg-accent-700"
                  placeholder="请确认密码"
                  type="password"
                  name="confirm-password"
                  password>
                  <template #prefix>
                     <StIcon class="text-2xl" name="Lock" />
                  </template>
               </StInput>
            </StFormItem>
            <StButton :loading @click.prevent="handleRegister"> 注册 </StButton>
         </StForm>
         <StDivider>或者</StDivider>
         <StButton class="!bg-accent-600 !text-accent-200 w-full">
            <div class="flex items-center gap-2">
               <IconQQ />
               使用 QQ 登录
            </div>
         </StButton>
      </div>
   </div>
</template>
