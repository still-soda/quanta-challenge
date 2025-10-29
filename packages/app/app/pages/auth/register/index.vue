<script setup lang="ts">
import { Lock, Mail, User } from '@icon-park/vue-next';
import z from 'zod';
import type { IRule } from '~/components/st/Form/type';
import { useRegister } from './_composables/use-register';
import { useMessage } from '~/components/st/Message/use-message';

useSeoMeta({ title: '注册 - Quanta Challenge' });

const {
   formdata,
   formKey,
   loading,
   handleRegister,
   onRegisterSuccess,
   onRegisterError,
} = useRegister();

onRegisterSuccess(() => {
   navigateTo('/app/dashboard', { replace: true });
});

const message = useMessage();
onRegisterError((error: Error) => {
   message.error(`注册失败: ${error.message}` || '注册失败，请稍后重试');
});

const { $trpc } = useNuxtApp();
const checkIfExistingUsername = useDebounceFn(async (username: string) => {
   const { exists } = await $trpc.auth.register.existingUser.query({
      username,
   });
   return exists;
}, 500);

const checkIfExistingEmail = useDebounceFn(async (email: string) => {
   const { exists } = await $trpc.auth.register.existingEmail.query({
      email,
   });
   return exists;
}, 500);

const rules = [
   {
      field: 'username',
      required: true,
      validator: async (value: string) =>
         /^[a-zA-Z0-9_]{3,20}$/.test(value) &&
         !(await checkIfExistingUsername(value)),
   },
   {
      field: 'email',
      required: true,
      validator: async (value: string) =>
         z.email().safeParse(value).success &&
         !(await checkIfExistingEmail(value)),
   },
   {
      field: 'password',
      required: true,
      validator: (value: string) => value.length >= 6,
   },
   {
      field: 'confirmPassword',
      required: true,
      validator: (value: string) => value === formdata.password,
   },
] as const satisfies IRule[];

const status = useAsyncStatus(rules, formdata);
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
            <StFormItem
               name="username"
               error-message="用户名必须由英文、数字和下划线组成, 且长度在3到20个字符之间">
               <StInput
                  :status="status['username']"
                  v-model:value="formdata.username"
                  outer-class="bg-accent-700"
                  placeholder="请输入用户名">
                  <template #prefix>
                     <User class="text-2xl" />
                  </template>
               </StInput>
            </StFormItem>
            <StFormItem name="email" error-message="请输入有效的邮箱地址">
               <StInput
                  :status="status['email']"
                  v-model:value="formdata.email"
                  outer-class="bg-accent-700"
                  placeholder="请输入邮箱">
                  <template #prefix>
                     <Mail class="text-2xl" />
                  </template>
               </StInput>
            </StFormItem>
            <StFormItem name="password" error-message="密码至少需要6个字符">
               <StInput
                  :status="status['password']"
                  v-model:value="formdata.password"
                  outer-class="bg-accent-700"
                  placeholder="请输入密码"
                  type="password"
                  name="password"
                  password>
                  <template #prefix>
                     <Lock class="text-2xl" />
                  </template>
               </StInput>
            </StFormItem>
            <StFormItem
               name="confirmPassword"
               error-message="两次输入的密码不一致">
               <StInput
                  :status="status['confirmPassword']"
                  v-model:value="formdata.confirmPassword"
                  outer-class="bg-accent-700"
                  placeholder="请确认密码"
                  type="password"
                  name="confirm-password"
                  password>
                  <template #prefix>
                     <Lock class="text-2xl" />
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
