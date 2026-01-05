import type { User } from '@prisma/client';
import type { TRPCClient } from '@trpc/client';
import { defineStore } from 'pinia';
import type { AppRouter } from '~~/server/trpc/routes';

const useAuthStore = defineStore('auth', () => {
   const user = ref<User | null>(null);

   // 在客户端立即从 localStorage 加载 CSRF token
   const csrfToken = ref<string | null>(
      import.meta.client && typeof localStorage !== 'undefined'
         ? localStorage.getItem('csrfToken')
         : null
   );

   const initToken = () => {
      if (import.meta.server) return;
      const token = localStorage.getItem('csrfToken');
      if (token) {
         csrfToken.value = token;
      }
   };

   const setCsrfToken = (token: string) => {
      csrfToken.value = token;
      if (import.meta.client) {
         localStorage.setItem('csrfToken', token);
      }
   };

   const fetchUserInfo = async (trpc: TRPCClient<AppRouter>) => {
      try {
         const result = await trpc.auth.login.getUser.query();
         if (result.user) {
            user.value = transformObjectFields(
               result.user,
               ['createdAt', 'updatedAt', 'lastLogin'],
               (value: any) => new Date(value)
            );
            return true;
         }
         return false;
      } catch (error) {
         console.error(error);
         return false;
      }
   };

   return {
      user,
      csrfToken,
      setCsrfToken,
      initToken,
      fetchUserInfo,
   };
});

export default useAuthStore;
