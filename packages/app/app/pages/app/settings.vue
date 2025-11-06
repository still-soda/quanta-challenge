<script setup lang="ts">
import { Shield, User, Config, ApplicationMenu } from '@icon-park/vue-next';

useSeoMeta({ title: '设置 - Quanta Challenge' });

const route = useRoute();

const settingsMenu = [
   {
      key: 'general',
      label: '常规设置',
      icon: Config,
      path: '/app/settings',
   },
   {
      key: 'profile',
      label: '个人资料',
      icon: User,
      path: '/app/space',
   },
   {
      key: 'security',
      label: '安全设置',
      icon: Shield,
      path: '/app/settings/security',
   },
   {
      key: 'advanced',
      label: '高级设置',
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
   <StSpace fill justify="center" class="overflow-auto">
      <StSpace gap="1rem" class="w-[48rem] pb-[2rem] my-8" align="start">
         <!-- 侧边栏导航 -->
         <StSpace
            direction="vertical"
            gap="0.375rem"
            class="w-[10rem] shrink-0 sticky top-0">
            <h1 class="st-font-hero-bold mb-3">设置</h1>

            <StSpace direction="vertical" gap="0.25rem" fill-x>
               <div
                  v-for="item in settingsMenu"
                  :key="item.key"
                  @click="handleMenuClick(item.path)"
                  class="px-4 py-2.5 rounded-lg cursor-pointer transition-all border"
                  :class="
                     activeKey === item.key
                        ? 'bg-accent-500 border-accent-400 text-white'
                        : 'border-accent-600 text-accent-200 hover:border-accent-500 hover:bg-accent-600 hover:text-white'
                  ">
                  <StSpace gap="0.625rem" align="center">
                     <component
                        :is="item.icon"
                        class="text-lg shrink-0"
                        :class="
                           activeKey === item.key
                              ? 'text-primary'
                              : 'text-accent-300'
                        " />
                     <span class="text-sm font-medium">{{ item.label }}</span>
                  </StSpace>
               </div>
            </StSpace>
         </StSpace>

         <!-- 内容区域 -->
         <div class="flex-1 min-w-0 px-[0.625rem] min-h-[50vh]">
            <NuxtPage />
         </div>
      </StSpace>
   </StSpace>
</template>
