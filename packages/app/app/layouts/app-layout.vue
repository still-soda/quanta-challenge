<script setup lang="ts">
import { Remind, Search, TableReport } from '@icon-park/vue-next';
import useAuthStore from '~/stores/auth-store';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role !== 'USER');

const username = computed(
   () => authStore.user?.displayName || authStore.user?.name || '用户'
);

const avatarUrl = computed(() =>
   authStore.user?.imageId ? `/api/static/${authStore.user.imageId}.jpg` : ''
);

const description = computed(() => {
   return isAdmin.value ? '管理员' : '普通用户';
});

const handleMyPublish = () => {
   navigateTo('/app/publish/problem/mine');
};

// 搜索功能
const { openSearch } = useSearch();

const handleSearchClick = () => {
   openSearch();
};

// 全局快捷键 Cmd/Ctrl + K
const handleKeydown = (e: KeyboardEvent) => {
   if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
   }
};

onMounted(() => {
   window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
   window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
   <div class="w-full flex min-w-[1440px]">
      <StSidebar class="w-[9.3125rem] !fixed left-0 top-0 h-screen" />
      <div class="w-[9.3125rem]"></div>
      <main class="flex flex-col flex-1">
         <StHeader
            mode="gradient"
            class="fixed top-0 !w-[calc(100vw-9.3125rem)] !min-w-[calc(1440px-9.3125rem)]">
            <template #left>
               <StSpace gap="0.75rem" align="center">
                  <StHeaderButton text="搜索" @click="handleSearchClick">
                     <Search class="text-[1.25rem]" />
                  </StHeaderButton>
                  <StHeaderButton text="通知">
                     <Remind class="text-[1.25rem]" />
                  </StHeaderButton>
                  <StHeaderButton
                     v-if="isAdmin"
                     @click="handleMyPublish"
                     text="我的发布">
                     <TableReport class="text-[1.25rem]" />
                  </StHeaderButton>
               </StSpace>
            </template>
            <template #right>
               <StHeaderProfile
                  :name="username"
                  :desc="description"
                  :url="avatarUrl" />
            </template>
         </StHeader>

         <div class="h-[5.75rem]"></div>
         <slot></slot>
      </main>

      <!-- 搜索覆盖层 -->
      <StSearchOverlay />

      <!-- 对话框覆盖层 -->
      <DialogOverlay />
   </div>
</template>

<style lang="css" scoped>
.top-mask {
   background: linear-gradient(0deg, #11111100 0%, #111111 94.71%);
}
</style>
