<script setup lang="ts">
import useAuthStore from '~/stores/auth-store';

const authStore = useAuthStore();

// 如果用户已登录，重定向到用户自己的空间
if (authStore.user?.name) {
   await navigateTo(`/app/space/${authStore.user.name}`, { replace: true });
} else {
   // 如果未登录，重定向到登录页
   await navigateTo('/auth/login', { replace: true });
}
</script>

<template>
   <div></div>
</template>
