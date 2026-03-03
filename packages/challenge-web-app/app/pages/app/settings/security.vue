<script setup lang="ts">
import { Mail, Fingerprint, Key, FaceRecognition } from '@icon-park/vue-next';
import z from 'zod';
import type { IRule } from '~/components/st/Form/type';
import { useRegisterAuthn } from '../_composables/use-register-authn';
import Section from './_components/Section.vue';
import Divider from './_components/Divider.vue';
import Button from './_components/Button.vue';
import Input from './_components/Input.vue';

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
</script>

<template>
   <StSpace fill-x direction="vertical" gap="1.5rem">
      <!-- WebAuthn Card -->
      <Section
         title="WebAuthn 身份验证"
         desc="使用生物识别或安全密钥进行无密码登录"
         :icon="Fingerprint">
         <StForm
            :rules="rules"
            :model-value="formdata"
            :ref="formKey"
            class="w-full"
            @keydown.enter.prevent="handleRegister">
            <StSpace direction="vertical" gap="0.75rem">
               <StFormItem name="email" class="!w-96">
                  <Input
                     autocomplete="webauthn"
                     v-model:value="formdata.email"
                     placeholder="请输入您的邮箱地址"
                     :icon="Mail" />
               </StFormItem>

               <Button :loading="loading">注册新设备</Button>
            </StSpace>
         </StForm>
      </Section>

      <Divider />

      <Section title="密码设置" desc="修改您的登录密码" :icon="Key">
         <StSpace direction="vertical" gap="0.75rem">
            <StFormItem name="email" class="!w-96">
               <Input
                  v-model:value="formdata.email"
                  placeholder="请输入您的邮箱地址"
                  :icon="Mail" />
            </StFormItem>

            <StFormItem name="verifyCode" class="!w-96">
               <StSpace fill-x gap="0.8rem">
                  <Input
                     v-model:value="formdata.email"
                     placeholder="请输入邮箱验证码"
                     :icon="FaceRecognition" />
                  <Button :loading="loading" level="secondary">
                     发送验证码
                  </Button>
               </StSpace>
            </StFormItem>

            <StFormItem name="pwd" class="!w-96">
               <Input
                  password
                  v-model:value="formdata.email"
                  placeholder="请输入您的新密码"
                  :icon="Key" />
            </StFormItem>

            <StFormItem name="confirmPwd" class="!w-96">
               <Input
                  password
                  v-model:value="formdata.email"
                  placeholder="确认您的新密码"
                  :icon="Key" />
            </StFormItem>

            <Button :loading="loading">修改密码</Button>
         </StSpace>
      </Section>
   </StSpace>
</template>
