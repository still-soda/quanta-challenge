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
         class="bg-accent-600/10 border border-accent-600/30 rounded-xl overflow-hidden transition-all hover:border-accent-500/50">
         <div class="p-6 border-b border-accent-600/30 flex items-start gap-5">
            <div
               class="p-3 bg-primary/10 rounded-xl text-primary shrink-0 border border-primary/20">
               <Config class="text-2xl" />
            </div>
            <div class="flex-1">
               <h2 class="text-lg font-bold text-white mb-1">界面与显示</h2>
               <p class="text-sm text-accent-300 leading-relaxed max-w-2xl">
                  自定义界面的外观和语言偏好。
               </p>
            </div>
         </div>

         <div class="p-6 bg-accent-700/20 space-y-6">
            <!-- Language -->
            <div class="flex items-center justify-between gap-4">
               <div class="flex items-center gap-3">
                  <Translate class="text-xl text-accent-400" />
                  <div>
                     <div class="text-sm font-medium text-accent-200">
                        显示语言
                     </div>
                     <div class="text-xs text-accent-400">
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
               <div class="flex items-center gap-3">
                  <Moon class="text-xl text-accent-400" />
                  <div>
                     <div class="text-sm font-medium text-accent-200">
                        颜色主题
                     </div>
                     <div class="text-xs text-accent-400">
                        切换深色或浅色模式
                     </div>
                  </div>
               </div>
               <div
                  class="flex bg-accent-700 rounded-lg p-1 border border-accent-600">
                  <button
                     class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                     :class="
                        theme === 'light'
                           ? 'bg-accent-600 text-white shadow'
                           : 'text-accent-400 hover:text-accent-200'
                     "
                     @click="theme = 'light'">
                     浅色
                  </button>
                  <button
                     class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                     :class="
                        theme === 'dark'
                           ? 'bg-accent-600 text-white shadow'
                           : 'text-accent-400 hover:text-accent-200'
                     "
                     @click="theme = 'dark'">
                     深色
                  </button>
                  <button
                     class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                     :class="
                        theme === 'system'
                           ? 'bg-accent-600 text-white shadow'
                           : 'text-accent-400 hover:text-accent-200'
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
         class="bg-accent-600/10 border border-accent-600/30 rounded-xl overflow-hidden transition-all hover:border-accent-500/50">
         <div class="p-6 border-b border-accent-600/30 flex items-start gap-5">
            <div
               class="p-3 bg-blue-500/10 rounded-xl text-blue-500 shrink-0 border border-blue-500/20">
               <Remind class="text-2xl" />
            </div>
            <div class="flex-1">
               <h2 class="text-lg font-bold text-white mb-1">通知偏好</h2>
               <p class="text-sm text-accent-300 leading-relaxed max-w-2xl">
                  管理您接收通知的方式和内容。
               </p>
            </div>
         </div>

         <div class="p-6 bg-accent-700/20 space-y-4">
            <!-- Toggles (Mock) -->
            <div class="flex items-center justify-between">
               <span class="text-sm text-accent-200">接收每周摘要邮件</span>
               <StSwitch v-model="notifications.email" />
            </div>
            <div class="flex items-center justify-between">
               <span class="text-sm text-accent-200">浏览器推送通知</span>
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
