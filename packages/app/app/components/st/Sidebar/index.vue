<script setup lang="ts">
import Logo from '~/components/icon/Logo.vue';
import useAuthStore from '~/stores/auth-store';

const authStore = useAuthStore();
const role = computed(() => authStore.user?.role ?? 'USER');
</script>

<template>
   <aside class="relative px-8 py-12 flex justify-center w-fit">
      <Logo class="absolute top-8" />
      <StSpace
         direction="vertical"
         justify="center"
         gap="2rem"
         class="h-full w-full text-[1.5rem]">
         <StSpace
            direction="vertical"
            align="center"
            justify="center"
            class="h-full">
            <StSidebarSidePopper content="仪表盘">
               <StSidebarNavigationButton to="/app/dashboard">
                  <StIcon name="DashboardTwo" />
               </StSidebarNavigationButton>
            </StSidebarSidePopper>
            <StSidebarSidePopper content="排行榜">
               <StSidebarNavigationButton to="#">
                  <StIcon name="Ranking" />
               </StSidebarNavigationButton>
            </StSidebarSidePopper>
            <StSidebarSidePopper content="题目">
               <StSidebarNavigationButton to="/app/problems">
                  <StIcon name="TableReport" />
               </StSidebarNavigationButton>
            </StSidebarSidePopper>
            <StSidebarSidePopper v-if="role !== 'USER'" content="发布题目">
               <StSidebarNavigationButton to="/app/publish">
                  <StIcon name="UploadTwo" />
               </StSidebarNavigationButton>
            </StSidebarSidePopper>
            <StSidebarSidePopper content="成就">
               <StSidebarNavigationButton to="#">
                  <StIcon name="Trophy" />
               </StSidebarNavigationButton>
            </StSidebarSidePopper>
            <StSidebarSidePopper content="设置">
               <StSidebarNavigationButton to="/app/settings">
                  <StIcon name="SettingTwo" />
               </StSidebarNavigationButton>
            </StSidebarSidePopper>
         </StSpace>
         <StSidebarNavigationButton to="#">
            <StIcon name="Plus" />
         </StSidebarNavigationButton>
      </StSpace>
   </aside>
</template>
