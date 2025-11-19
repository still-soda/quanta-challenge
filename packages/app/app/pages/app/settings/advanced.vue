<script setup lang="ts">
import {
   ApplicationMenu,
   Terminal,
   Delete,
   Download,
} from '@icon-park/vue-next';

useSeoMeta({ title: '高级设置 - Quanta Challenge' });

const devMode = ref(false);
</script>

<template>
   <div class="space-y-6 animate-fade-in-up">
      <!-- Developer Options -->
      <div
         class="bg-accent-600/10 border border-accent-600/30 rounded-xl overflow-hidden transition-all hover:border-accent-500/50">
         <div class="p-6 border-b border-accent-600/30 flex items-start gap-5">
            <div
               class="p-3 bg-purple-500/10 rounded-xl text-purple-500 shrink-0 border border-purple-500/20">
               <Terminal class="text-2xl" />
            </div>
            <div class="flex-1">
               <h2 class="text-lg font-bold text-white mb-1">开发者选项</h2>
               <p class="text-sm text-accent-300 leading-relaxed max-w-2xl">
                  开启实验性功能和调试工具。这些功能可能不稳定。
               </p>
            </div>
         </div>
         <div class="p-6 bg-accent-700/20 flex items-center justify-between">
            <div>
               <div class="text-sm font-medium text-accent-200">
                  启用开发者模式
               </div>
               <div class="text-xs text-accent-400">
                  访问更多调试信息和未发布功能
               </div>
            </div>
            <StSwitch v-model="devMode" />
         </div>
      </div>

      <!-- Data Management -->
      <div
         class="bg-accent-600/10 border border-accent-600/30 rounded-xl overflow-hidden transition-all hover:border-accent-500/50">
         <div class="p-6 border-b border-accent-600/30 flex items-start gap-5">
            <div
               class="p-3 bg-green-500/10 rounded-xl text-green-500 shrink-0 border border-green-500/20">
               <Download class="text-2xl" />
            </div>
            <div class="flex-1">
               <h2 class="text-lg font-bold text-white mb-1">数据管理</h2>
               <p class="text-sm text-accent-300 leading-relaxed max-w-2xl">
                  导出您的个人数据或提交记录。
               </p>
            </div>
         </div>
         <div class="p-6 bg-accent-700/20">
            <StButton :bordered="true" theme="secondary">导出所有数据</StButton>
         </div>
      </div>

      <!-- Danger Zone -->
      <div
         class="border border-red-500/30 rounded-xl overflow-hidden transition-all hover:border-red-500/50 bg-red-500/5">
         <div class="p-6 border-b border-red-500/20 flex items-start gap-5">
            <div
               class="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0 border border-red-500/20">
               <Delete class="text-2xl" />
            </div>
            <div class="flex-1">
               <h2 class="text-lg font-bold text-red-400 mb-1">危险区域</h2>
               <p class="text-sm text-red-400/70 leading-relaxed max-w-2xl">
                  不可逆的操作。请谨慎进行。
               </p>
            </div>
         </div>
         <div class="p-6 bg-red-500/10 flex items-center justify-between">
            <div>
               <div class="text-sm font-medium text-red-300">删除账户</div>
               <div class="text-xs text-red-400/60">
                  永久删除您的账户及所有相关数据
               </div>
            </div>
            <StButton theme="danger">删除账户</StButton>
         </div>
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
