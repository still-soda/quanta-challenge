<script setup lang="ts">
import { Remind, Search, TableReport } from '@icon-park/vue-next';
import useAuthStore from '~/stores/auth-store';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role !== 'USER');

const handleMyPublish = () => {
   navigateTo('/app/publish/problem/mine');
};
</script>

<template>
   <div class="w-full flex min-w-[1280px]">
      <StSidebar class="w-[9.3125rem] !fixed left-0 top-0 h-screen" />
      <div class="w-[9.3125rem]"></div>
      <main class="flex flex-col flex-1">
         <StHeader class="fixed top-0 !w-[calc(100vw-9.3125rem)]">
            <template #left>
               <StSpace gap="0.75rem" align="center">
                  <StHeaderButton text="搜索">
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
               <StHeaderProfile name="没有气的汽水" desc="20th前端CEO" />
            </template>
         </StHeader>

         <div class="h-[5.75rem]"></div>
         <slot></slot>
      </main>
   </div>
</template>

<style lang="css" scoped>
.top-mask {
   background: linear-gradient(0deg, #11111100 0%, #111111 94.71%);
}
</style>
