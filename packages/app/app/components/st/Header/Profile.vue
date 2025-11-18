<script setup lang="ts">
import { Logout, People } from '@icon-park/vue-next';
import { onClickOutside } from '@vueuse/core';

defineProps<{
   name: string;
   desc: string;
   url?: string;
}>();

const showMenu = ref(false);

// 获取按钮和菜单的引用
const avatarRef = useTemplateRef<HTMLElement>('avatar-button');
const menuRef = useTemplateRef<HTMLElement>('profile-menu');

// 点击外部关闭
onClickOutside(
   menuRef,
   () => {
      showMenu.value = false;
   },
   { ignore: [avatarRef] }
);

// 切换菜单显示
const toggleMenu = () => {
   showMenu.value = !showMenu.value;
};

// 跳转到个人空间
const handleGoToSpace = () => {
   showMenu.value = false;
   navigateTo('/app/space');
};

// 退出登录
const handleLogout = async () => {
   showMenu.value = false;

   const confirmed = await dialog.confirm({
      title: '确认退出登录？',
      description: '退出登录后需要重新登录才能继续使用。',
      variant: 'danger',
   });

   if (!confirmed) {
      return;
   }

   // 清除客户端 localStorage
   if (import.meta.client) {
      localStorage.removeItem('csrfToken');
   }

   // 跳转到认证页面
   await navigateTo('/auth/login');

   // 刷新页面以清除状态
   if (import.meta.client) {
      window.location.reload();
   }
};
</script>

<template>
   <div class="relative">
      <StSpace gap="0.875rem" align="center">
         <StSpace
            direction="vertical"
            align="end"
            justify="center"
            gap="0.25rem">
            <div class="font-bold">{{ name }}</div>
            <div class="font-light text-sm">{{ desc }}</div>
         </StSpace>
         <div ref="avatar-button" @click="toggleMenu" class="cursor-pointer">
            <StAvatar
               :url="url"
               class="w-10 h-10 hover:ring-2 ring-secondary transition-all" />
         </div>
      </StSpace>

      <!-- 下拉菜单 -->
      <Transition
         enter-active-class="transition-all duration-100 ease-out"
         enter-from-class="opacity-0 -translate-y-2"
         enter-to-class="opacity-100 translate-y-0"
         leave-active-class="transition-all duration-100 ease-in"
         leave-from-class="opacity-100 translate-y-0"
         leave-to-class="opacity-0 -translate-y-2">
         <div
            v-show="showMenu"
            ref="profile-menu"
            class="absolute top-full right-0 mt-2 w-48 bg-accent-600 rounded-xl shadow-2xl border border-accent-500 z-50 overflow-hidden">
            <div class="py-2">
               <!-- 个人空间 -->
               <div
                  @click="handleGoToSpace"
                  class="px-4 py-3 hover:bg-accent-500 cursor-pointer transition-colors flex items-center gap-3 text-white">
                  <People class="text-lg" />
                  <span>个人空间</span>
               </div>

               <!-- 分隔线 -->
               <!-- <div class="h-px bg-accent-500 mx-2 my-1"></div> -->

               <!-- 退出登录 -->
               <div
                  @click="handleLogout"
                  class="px-4 py-3 hover:bg-accent-500 cursor-pointer transition-colors flex items-center gap-3 text-white">
                  <Logout class="text-lg" />
                  <span>退出登录</span>
               </div>
            </div>
         </div>
      </Transition>
   </div>
</template>
