<script setup lang="ts">
import { useWebAuthnLogin } from '~/composables/auth/use-login-authn';
import type { IRule } from '../../../components/st/Form/type';
import z from 'zod';

const {
   formdata,
   formKey,
   loading,
   handleStartAuthenticating,
   onAuthenticateSuccess,
   onAuthenticateError,
} = useWebAuthnLogin();

onAuthenticateSuccess(() => {
   navigateTo('/app/dashboard');
});
onAuthenticateError(() => {
   alert('Authentication Failed');
});

const rules: IRule[] = [
   {
      name: 'email',
      required: true,
      validator: (value: string) => z.email().safeParse(value).success,
   },
];

const gotoPasswordLogin = () => {
   navigateTo('/auth/login');
};
</script>

<template>
   <div class="w-screen h-screen flex items-center justify-center">
      <div
         class="bg-[#1a1a1a] p-6 pt-8 flex flex-col items-center rounded-r5 gap-6 w-[28.5rem]">
         <IconLogo />
         <div class="flex flex-col items-center gap-r6">
            <h1 class="text-2xl font-bold">生物认证登录</h1>
            <p>
               <span class="text-accent-300">还没有账号？ </span>
               <NuxtLink href="/auth/register" class="text-white">
                  注册
               </NuxtLink>
            </p>
         </div>
         <StForm
            :ref="formKey"
            @keydown.enter.prevent="handleStartAuthenticating"
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
                     <StIcon class="text-2xl" name="Mail" />
                  </template>
               </StInput>
            </StFormItem>
            <StButton :loading @click.prevent="handleStartAuthenticating">
               开始认证
            </StButton>
         </StForm>
         <StDevider>或使用</StDevider>
         <div class="flex gap-4 w-full text-sm">
            <StButton
               @click.self="gotoPasswordLogin"
               class="!bg-accent-600 !text-accent-200 w-full">
               <NuxtLink to="/auth/login" class="flex gap-2 items-center">
                  <StIcon name="Key" class="text-xl text-[#9D9D9D]" />
                  密码登录
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
