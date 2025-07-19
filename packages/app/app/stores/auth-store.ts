import type { User } from '@prisma/client';
import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', () => {
   const user = ref<User | null>(null);
   const refreshToken = ref<string | null>(null);
   const accessToken = ref<string | null>(null);

   const initTokens = () => {
      refreshToken.value = localStorage.getItem('refreshToken');
      accessToken.value = localStorage.getItem('accessToken');
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
   };
});

export default useAuthStore;
