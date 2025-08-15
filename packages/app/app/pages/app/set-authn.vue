<script setup lang="ts">
import { Mail } from '@icon-park/vue-next';
import z from 'zod';
import type { IRule } from '~/components/st/Form/type';
import { useRegisterAuthn } from '~/composables/auth/use-register-authn';

const {
   formdata,
   handleRegister,
   loading,
   formKey,
   onRegisterSuccess,
   onRegisterError,
} = useRegisterAuthn();

onRegisterSuccess(() => {
   alert('Registration Success');
});
onRegisterError(() => {
   alert('Registration Failed');
});

const rules: IRule[] = [
   {
      name: 'email',
      required: true,
      validator: (value: string) => z.email().safeParse(value).success,
   },
];
</script>

<template>
   <div class="w-screen h-screen flex items-center justify-center">
      <StForm
         :rules="rules"
         :model-value="formdata"
         :ref="formKey"
         @keydown.enter.prevent="handleRegister">
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
         <StButton
            @click.prevent="handleRegister"
            :loading="loading"
            class="w-full">
            注册
         </StButton>
      </StForm>
   </div>
</template>
