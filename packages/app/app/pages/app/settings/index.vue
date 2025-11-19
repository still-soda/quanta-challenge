<script setup lang="ts">
import { Config, Translate, Moon, Remind } from '@icon-park/vue-next';

useSeoMeta({ title: '常规设置 - Quanta Challenge' });

const language = ref('zh-CN');
const theme = ref('dark');
const notifications = ref({
   email: true,
   browser: false,
});
</script>

<template>
   <div class="space-y-6 animate-fade-in-up">
      <!-- Appearance Card -->
      <div
         class="bg-accent-600 rounded-[1.25rem] overflow-hidden border border-white/5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group">
         <div class="p-6 flex items-start gap-6">
            <div
               class="p-4 rounded-2xl shrink-0 border border-white/10 bg-gradient-to-br from-purple-500/20 to-blue-500/5 group-hover:from-purple-500/30 group-hover:to-blue-500/10 transition-colors">
               <Config class="text-3xl text-purple-400" />
            </div>
            <div class="flex-1 py-1">
               <h2 class="text-xl font-bold text-white mb-2">界面与显示</h2>
               <p class="text-sm text-accent-200 leading-relaxed max-w-2xl">
                  自定义界面的外观和语言偏好，打造专属的视觉体验。
               </p>
            </div>
         </div>

         <div class="p-6 space-y-6">
            <!-- Language -->
            <div class="flex items-center justify-between gap-4">
               <div class="flex items-center gap-4">
                  <div
                     class="w-10 h-10 rounded-full bg-accent-500/50 flex items-center justify-center">
                     <Translate class="text-xl text-accent-100" />
                  </div>
                  <div>
                     <div class="text-base font-bold text-white">显示语言</div>
                     <div class="text-xs text-accent-300 mt-0.5">
                        选择界面的主要语言
                     </div>
                  </div>
               </div>
               <StSelect
                  v-model:value="language"
                  :options="[
                     { label: '简体中文', value: 'zh-CN' },
                     { label: 'English', value: 'en-US' },
                  ]"
                  outer-class="!bg-accent-700/50 !border !border-accent-600/50 !py-2.5 !px-4 min-w-[150px]"
                  options-container-class="!bg-accent-700 !border-accent-600" />
            </div>

            <!-- Theme -->
            <div class="flex items-center justify-between">
               <div class="flex items-center gap-4">
                  <div
                     class="w-10 h-10 rounded-full bg-accent-500/50 flex items-center justify-center">
                     <Moon class="text-xl text-accent-100" />
                  </div>
                  <div>
                     <div class="text-base font-bold text-white">颜色主题</div>
                     <div class="text-xs text-accent-300 mt-0.5">
                        切换深色或浅色模式
                     </div>
                  </div>
               </div>
               <div
                  class="flex bg-accent-700 rounded-lg p-1.5 border border-accent-600/50">
                  <button
                     class="px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-300"
                     :class="
                        theme === 'light'
                           ? 'bg-accent-500 text-white shadow-md shadow-black/20'
                           : 'text-accent-400 hover:text-accent-200 hover:bg-accent-600/50'
                     "
                     @click="theme = 'light'">
                     浅色
                  </button>
                  <button
                     class="px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-300"
                     :class="
                        theme === 'dark'
                           ? 'bg-accent-500 text-white shadow-md shadow-black/20'
                           : 'text-accent-400 hover:text-accent-200 hover:bg-accent-600/50'
                     "
                     @click="theme = 'dark'">
                     深色
                  </button>
                  <button
                     class="px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-300"
                     :class="
                        theme === 'system'
                           ? 'bg-accent-500 text-white shadow-md shadow-black/20'
                           : 'text-accent-400 hover:text-accent-200 hover:bg-accent-600/50'
                     "
                     @click="theme = 'system'">
                     跟随系统
                  </button>
               </div>
            </div>
         </div>
      </div>

      <!-- Notifications Card -->
      <div
         class="bg-accent-600 rounded-[1.25rem] overflow-hidden border border-white/5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group">
         <div class="p-6 flex items-start gap-6">
            <div
               class="p-4 rounded-2xl shrink-0 border border-white/10 bg-gradient-to-br from-orange-500/20 to-red-500/5 group-hover:from-orange-500/30 group-hover:to-red-500/10 transition-colors">
               <Remind class="text-3xl text-orange-400" />
            </div>
            <div class="flex-1 py-1">
               <h2 class="text-xl font-bold text-white mb-2">通知偏好</h2>
               <p class="text-sm text-accent-200 leading-relaxed max-w-2xl">
                  管理您接收通知的方式和内容，不错过重要信息。
               </p>
            </div>
         </div>

         <div class="p-6 space-y-5">
            <!-- Toggles (Mock) -->
            <div class="flex items-center justify-between">
               <span class="text-base font-medium text-accent-100">
                  接收每周摘要邮件
               </span>
               <StSwitch v-model="notifications.email" />
            </div>
            <div class="flex items-center justify-between">
               <span class="text-base font-medium text-accent-100">
                  浏览器推送通知
               </span>
               <StSwitch v-model="notifications.browser" />
            </div>
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
