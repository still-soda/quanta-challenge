import useAuthStore from '~/stores/auth-store';

export default defineNuxtRouteMiddleware(async (to) => {
   if (to.path === '/auth/login') {
      return;
   }

   const authStore = useAuthStore();
   const { $trpc } = useNuxtApp();

   // 确保 CSRF token 已从 localStorage 加载
   if (import.meta.client && !authStore.csrfToken) {
      authStore.initToken();
   }

   if (!(await authStore.fetchUserInfo($trpc))) {
      console.log('auth login');
      return navigateTo('/auth/login');
   }
});
