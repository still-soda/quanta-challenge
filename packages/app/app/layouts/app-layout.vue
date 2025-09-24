<script setup lang="ts">
import { Remind, Search, TableReport } from '@icon-park/vue-next';
import useAuthStore from '~/stores/auth-store';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role !== 'USER');

const handleMyPublish = () => {
   navigateTo('/app/publish/mine');
};
</script>

<template>
   <div class="w-full h-full flex min-w-[1280px]">
      <StSidebar class="w-[9.3125rem]" />
      <main class="h-screen flex flex-col flex-1">
         <StHeader>
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
         <slot></slot>
      </main>
   </div>
</template>
