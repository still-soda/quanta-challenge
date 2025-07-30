import type { User } from '@prisma/client';
import type { TRPCClient } from '@trpc/client';
import { defineStore } from 'pinia';
import type { AppRouter } from '~~/server/trpc/routes';

const useAuthStore = defineStore('auth', () => {
   const user = ref<User | null>(null);
   const refreshToken = ref<string | null>(null);
   const accessToken = ref<string | null>(null);

   const initTokens = () => {
      refreshToken.value = localStorage.getItem('refreshToken');
      accessToken.value = localStorage.getItem('accessToken');
   };

   const fetchUserInfo = async (trpc: TRPCClient<AppRouter>) => {
      const result = await trpc.auth.login.getUser.query();
      if (result) {
         user.value = transformObjectFields(
            result,
            ['createdAt', 'updatedAt', 'lastLogin'],
            (value: any) => new Date(value)
         );
         return true;
      }
      return false;
   };

   const setTokens = (tokens: {
      accessToken: string;
      refreshToken: string;
   }) => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      accessToken.value = tokens.accessToken;
      refreshToken.value = tokens.refreshToken;
   };

   return {
      user,
      refreshToken,
      accessToken,
      setTokens,
      initTokens,
      fetchUserInfo,
   };
});

export default useAuthStore;
