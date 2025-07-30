<script setup lang="ts">
import useAuthStore from '~/stores/auth-store';

const authStore = useAuthStore();
const { $trpc } = useNuxtApp();
const checkUserHasLogin = async () => {
   if (authStore.user) return;
   if (!(await authStore.fetchUserInfo($trpc))) {
      navigateTo('/auth/login');
   }
};
onBeforeMount(checkUserHasLogin);
</script>

<template>
   <NuxtLayout name="app-layout">
      <NuxtPage />
   </NuxtLayout>
</template>
