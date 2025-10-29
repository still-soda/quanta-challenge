<script setup lang="ts">
import { useEmailLogin } from './_composables/use-login';
import type { IRule } from '~/components/st/Form/type';
import * as clientAuthn from '@simplewebauthn/browser';
import z from 'zod';
import { Fingerprint, Lock, Mail } from '@icon-park/vue-next';
import { useMessage } from '~/components/st/Message/use-message';

useSeoMeta({ title: '登录 - Quanta Challenge' });

const {
   formdata,
   formKey,
   loading,
   handleLogin,
   onLoginSuccess,
   onLoginError,
} = useEmailLogin();
const supportWebAuthn = ref(false);

const message = useMessage();
onLoginError((error: Error) => {
   message.error(`登录失败: ${error.message}` || '登录失败，请稍后重试');
});

onBeforeMount(() => {
   supportWebAuthn.value = clientAuthn.browserSupportsWebAuthn();
});

const redirect = useQuery<string>('redirect');
onLoginSuccess(() => {
   navigateTo(redirect.value ?? '/app/dashboard', { replace: true });
});

const rules: IRule[] = [
   {
      field: 'email',
      required: true,
      validator: (value: string) => z.email().safeParse(value).success,
   },
   {
      field: 'password',
      required: true,
      validator: (value: string) => value.length >= 6,
   },
];

const gotoWebAuthnLogin = () => {
   const url = redirect.value
      ? `/auth/login/authn?redirect=${encodeURIComponent(redirect.value)}`
      : '/auth/login/authn';
   navigateTo(url);
};
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
            v-if="formdata"
            :ref="formKey"
            @keydown.enter.prevent="handleLogin"
            v-model:model-value="formdata"
            :rules="rules"
            class="flex flex-col gap-4 w-full">
            <StFormItem name="email" error-message="请输入有效的邮箱地址">
               <StInput
                  autocomplete="webauthn"
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
            <StButton :loading @click.prevent="handleLogin">登录</StButton>
         </StForm>
         <StDivider>或使用</StDivider>
         <div class="flex gap-4 w-full text-sm">
            <StButton
               v-if="supportWebAuthn"
               @click.self="gotoWebAuthnLogin"
               class="!bg-accent-600 !text-accent-200 w-full">
               <NuxtLink to="/auth/login/authn" class="flex gap-2 items-center">
                  <Fingerprint class="text-xl text-[#9D9D9D]" />
                  生物认证
               </NuxtLink>
            </StButton>
            <StButton class="!bg-accent-600 !text-accent-200 w-full">
               <div class="flex gap-2 items-center">
                  <IconQQ />
                  QQ 登录
               </div>
            </StButton>
         </div>
      </div>
   </div>
</template>
