import type { User } from '@prisma/client';
import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', () => {
   const user = ref<User | null>(null);
   const refreshToken = ref<string | null>(null);
   const accessToken = ref<string | null>(null);
   return {
      user,
      refreshToken,
      accessToken,
   };
});

export default useAuthStore;
