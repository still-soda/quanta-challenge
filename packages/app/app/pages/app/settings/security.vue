<script setup lang="ts">
import { Mail, Fingerprint, Key } from '@icon-park/vue-next';
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
</script>

<template>
   <div class="space-y-6 animate-fade-in-up">
      <!-- WebAuthn Card -->
      <div
         class="bg-accent-600/10 border border-accent-600/30 rounded-xl overflow-hidden transition-all hover:border-accent-500/50">
         <div class="p-6 border-b border-accent-600/30 flex items-start gap-5">
            <div
               class="p-3 bg-primary/10 rounded-xl text-primary shrink-0 border border-primary/20">
               <Fingerprint class="text-2xl" />
            </div>
            <div class="flex-1">
               <h2 class="text-lg font-bold text-white mb-1">
                  WebAuthn 身份验证
               </h2>
               <p class="text-sm text-accent-300 leading-relaxed max-w-2xl">
                  使用生物识别（如 Touch ID、Face ID）或安全密钥（如
                  YubiKey）进行无密码登录。这比传统密码更安全，且能有效防止网络钓鱼攻击。
               </p>
            </div>
         </div>

         <div class="p-6 bg-accent-700/20">
            <StForm
               :rules="rules"
               :model-value="formdata"
               :ref="formKey"
               class="w-full max-w-lg"
               @keydown.enter.prevent="handleRegister">
               <StFormItem name="email" label="绑定邮箱" required>
                  <StInput
                     autocomplete="webauthn"
                     v-model:value="formdata.email"
                     placeholder="请输入您的邮箱地址"
                     outer-class="!bg-accent-700/50 !border-accent-600/50 focus-within:!border-primary/50 !py-2.5 !rounded-lg">
                     <template #prefix>
                        <Mail class="text-lg text-accent-400" />
                     </template>
                  </StInput>
               </StFormItem>

               <div class="mt-8 flex items-center gap-4">
                  <StButton
                     @click.prevent="handleRegister"
                     :loading="loading"
                     theme="primary"
                     class="!px-6 !py-2 !h-10 !rounded-lg font-medium shadow-lg shadow-primary/20">
                     注册新设备
                  </StButton>
                  <p class="text-xs text-accent-400">
                     点击注册后，请按照浏览器提示完成验证
                  </p>
               </div>
            </StForm>
         </div>
      </div>

      <!-- Password Card (Placeholder) -->
      <div
         class="bg-accent-600/5 border border-accent-600/20 rounded-xl p-6 flex items-center justify-between opacity-60 grayscale">
         <div class="flex items-center gap-5">
            <div class="p-3 bg-accent-600/20 rounded-xl text-accent-300">
               <Key class="text-2xl" />
            </div>
            <div>
               <h2 class="text-lg font-bold text-accent-200 mb-1">密码设置</h2>
               <p class="text-sm text-accent-400">修改您的登录密码</p>
            </div>
         </div>
         <StButton disabled theme="secondary" :bordered="true">
            暂不支持
         </StButton>
      </div>
   </div>
</template>

<style scoped>
.animate-fade-in-up {
   animation: fadeInUp 0.25s ease-out;
}

@keyframes fadeInUp {
   from {
      opacity: 0;
      transform: translateY(10px);
   }
   to {
      opacity: 1;
      transform: translateY(0);
   }
}
</style>
