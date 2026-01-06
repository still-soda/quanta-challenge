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
         class="bg-accent-600 rounded-[1.25rem] overflow-hidden border border-white/5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group">
         <div class="p-6 flex items-start gap-6">
            <div
               class="p-4 rounded-2xl shrink-0 border border-white/10 bg-gradient-to-br from-pink-500/20 to-rose-500/5 group-hover:from-pink-500/30 group-hover:to-rose-500/10 transition-colors">
               <Terminal class="text-3xl text-pink-400" />
            </div>
            <div class="flex-1 py-1">
               <h2 class="text-xl font-bold text-white mb-2">开发者选项</h2>
               <p class="text-sm text-accent-200 leading-relaxed max-w-2xl">
                  开启实验性功能和调试工具。这些功能可能不稳定，仅供开发人员使用。
               </p>
            </div>
         </div>
         <div class="p-6 flex items-center justify-between">
            <div>
               <div class="text-base font-bold text-white">启用开发者模式</div>
               <div class="text-xs text-accent-300 mt-0.5">
                  访问更多调试信息和未发布功能
               </div>
            </div>
            <StSwitch v-model="devMode" />
         </div>
      </div>

      <!-- Data Management -->
      <div
         class="bg-accent-600 rounded-[1.25rem] overflow-hidden border border-white/5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group">
         <div class="p-6 flex items-start gap-6">
            <div
               class="p-4 rounded-2xl shrink-0 border border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-500/5 group-hover:from-cyan-500/30 group-hover:to-blue-500/10 transition-colors">
               <Download class="text-3xl text-cyan-400" />
            </div>
            <div class="flex-1 py-1">
               <h2 class="text-xl font-bold text-white mb-2">数据管理</h2>
               <p class="text-sm text-accent-200 leading-relaxed max-w-2xl">
                  导出您的个人数据或提交记录，掌握您的数据主权。
               </p>
            </div>
         </div>
         <div class="p-6">
            <StButton :bordered="true" theme="secondary">导出所有数据</StButton>
         </div>
      </div>

      <!-- Danger Zone -->
      <div
         class="rounded-[1.25rem] overflow-hidden transition-all duration-300 bg-red-500/5 border border-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 group">
         <div class="p-6 border-b border-red-500/10 flex items-start gap-6">
            <div
               class="p-4 rounded-2xl shrink-0 border border-red-500/20 bg-gradient-to-br from-red-500/20 to-orange-500/5 group-hover:from-red-500/30 group-hover:to-orange-500/10 transition-colors">
               <Delete class="text-3xl text-red-400" />
            </div>
            <div class="flex-1 py-1">
               <h2 class="text-xl font-bold text-red-400 mb-2">危险区域</h2>
               <p class="text-sm text-red-400/70 leading-relaxed max-w-2xl">
                  执行不可逆的操作，如删除账户。请务必谨慎进行。
               </p>
            </div>
         </div>
         <div class="p-6 bg-red-500/5 flex items-center justify-between">
            <div>
               <div class="text-base font-bold text-red-300">删除账户</div>
               <div class="text-xs text-red-400/60 mt-0.5">
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
