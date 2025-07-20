<script setup lang="ts">
import Logo from '~/components/icon/Logo.vue';
</script>

<template>
   <aside class="relative px-8 py-12 flex justify-center">
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
            <StSidebarNavigationButton to="#">
               <StIcon name="DashboardTwo" />
            </StSidebarNavigationButton>
            <StSidebarNavigationButton to="#">
               <StIcon name="Ranking" />
            </StSidebarNavigationButton>
            <StSidebarNavigationButton to="#">
               <StIcon name="TableReport" />
            </StSidebarNavigationButton>
            <StSidebarNavigationButton to="#">
               <StIcon name="Trophy" />
            </StSidebarNavigationButton>
            <StSidebarNavigationButton to="#">
               <StIcon name="SettingTwo" />
            </StSidebarNavigationButton>
         </StSpace>
         <StSidebarNavigationButton to="#">
            <StIcon name="Plus" />
         </StSidebarNavigationButton>
      </StSpace>
   </aside>
</template>
