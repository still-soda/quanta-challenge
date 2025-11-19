<script setup lang="ts">
import { Shield, Config, ApplicationMenu } from '@icon-park/vue-next';

useSeoMeta({ title: '设置 - Quanta Challenge' });

const route = useRoute();

const settingsMenu = [
   {
      key: 'general',
      label: '常规',
      icon: Config,
      path: '/app/settings',
   },
   {
      key: 'security',
      label: '安全',
      icon: Shield,
      path: '/app/settings/security',
   },
   {
      key: 'advanced',
      label: '高级',
      icon: ApplicationMenu,
      path: '/app/settings/advanced',
   },
];

const activeKey = computed(() => {
   const path = route.path;
   if (path === '/app/settings') return 'general';
   const menu = settingsMenu.find((item) => item.path === path);
   return menu?.key || 'general';
});

const handleMenuClick = (path: string) => {
   navigateTo(path);
};
</script>

<template>
   <StSpace
      fill
      justify="center"
      class="overflow-y-auto overflow-x-hidden pt-6">
      <StSpace
         direction="vertical"
         gap="2rem"
         class="w-full max-w-[56rem] pb-48 min-h-[calc(100vh-4rem)]">
         <!-- 顶部标题与标签页整合 -->
         <div class="flex items-center justify-between w-full">
            <h1 class="text-[2.5rem] font-bold text-white leading-none">
               设置
            </h1>

            <div
               class="flex items-center gap-1 bg-accent-600/20 p-1 rounded-lg border border-accent-600/30 backdrop-blur-sm">
               <div
                  v-for="item in settingsMenu"
                  :key="item.key"
                  @click="handleMenuClick(item.path)"
                  class="px-4 py-2 rounded-md cursor-pointer transition-all duration-200 flex items-center gap-2 select-none"
                  :class="[
                     activeKey === item.key
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'text-accent-300 hover:text-white hover:bg-accent-600/30',
                  ]">
                  <component
                     :is="item.icon"
                     class="text-lg"
                     :class="
                        activeKey === item.key
                           ? 'text-primary'
                           : 'text-accent-400'
                     " />
                  <span class="text-sm font-medium">{{ item.label }}</span>
               </div>
            </div>
         </div>

         <!-- 内容区域 -->
         <div class="w-full min-h-[400px]">
            <NuxtPage />
         </div>
      </StSpace>
   </StSpace>
</template>
