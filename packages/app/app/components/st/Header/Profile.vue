<script setup lang="ts">
import { Logout, People } from '@icon-park/vue-next';
import type { MenuItem } from '../DropdownMenu/type';

defineProps<{
   name: string;
   desc: string;
   url?: string;
}>();

const menuItems: MenuItem[] = [
   {
      icon: People,
      label: '个人空间',
      action: () => {},
   },
   {
      icon: Logout,
      label: '退出登录',
      action: () => {},
   },
];
</script>

<template>
   <StSpace gap="0.625rem" align="center">
      <StSpace direction="vertical" align="end" justify="center" gap="0.25rem">
         <div class="font-bold">{{ name }}</div>
         <div class="font-light text-sm">{{ desc }}</div>
      </StSpace>
      <NuxtLink to="/app/space">
         <StAvatar :url="url" class="w-10 h-10 cursor-pointer" />
      </NuxtLink>
   </StSpace>
</template>
