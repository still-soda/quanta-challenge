<script setup lang="ts">
import { Mail, Shield } from '@icon-park/vue-next';
import z from 'zod';
import type { IRule } from '~/components/st/Form/type';
import { useRegisterAuthn } from '../_composables/use-register-authn';

useSeoMeta({ title: '安全设置 - Quanta Challenge' });

const {
   formdata,
   handleRegister,
   loading,
   formKey,
   onRegisterSuccess,
   onRegisterError,
} = useRegisterAuthn();

onRegisterSuccess(() => {
   alert('WebAuthn 注册成功');
});
onRegisterError(() => {
   alert('WebAuthn 注册失败');
});

const rules: IRule[] = [
   {
      field: 'email',
      required: true,
      validator: (value: string) => z.email().safeParse(value).success,
   },
];

const outerClass = 'border !py-4 !px-4 !rounded-[0.5rem] w-full';
</script>

<template>
   <StSpace direction="vertical" gap="1.5rem" fill-x>
      <!-- 标题区域 -->
      <StSpace gap="0.75rem" align="center">
         <Shield class="text-2xl text-primary shrink-0" />
         <StSpace direction="vertical" gap="0.125rem">
            <h2 class="st-font-third-bold">WebAuthn 身份验证</h2>
            <p class="text-xs text-accent-300">
               使用生物识别或安全密钥进行无密码登录
            </p>
         </StSpace>
      </StSpace>

      <!-- 分割线 -->
      <div class="h-[1px] w-full bg-accent-500"></div>

      <!-- 表单区域 -->
      <StForm
         :rules="rules"
         :model-value="formdata"
         :ref="formKey"
         class="w-full"
         @keydown.enter.prevent="handleRegister">
         <StSpace direction="vertical" gap="1.75rem" class="w-full">
            <StFormItem name="email" label="邮箱地址" required>
               <StInput
                  autocomplete="webauthn"
                  v-model:value="formdata.email"
                  placeholder="请输入您的邮箱地址"
                  :outer-class>
                  <template #prefix>
                     <Mail class="text-xl" />
                  </template>
               </StInput>
            </StFormItem>
         </StSpace>

         <StSpace justify="end" class="mt-[2.13rem]">
            <StButton
               @click.prevent="handleRegister"
               :loading="loading"
               class="py-[0.375rem] px-[1.25rem] text-accent-100 !rounded-[0.375rem]">
               注册 WebAuthn
            </StButton>
         </StSpace>
      </StForm>
   </StSpace>
</template>
