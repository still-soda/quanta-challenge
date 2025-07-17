import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/trpc/routes/index';
import useAuthStore from '~/stores/auth-store';

export default defineNuxtPlugin(() => {
   const authStore = useAuthStore();

   const trpcClient = createTRPCClient<AppRouter>({
      links: [
         httpBatchLink({
            url: '/api/trpc',
            headers() {
               if (!authStore.accessToken) return {};
               return {
                  Authorization: `Bearer ${authStore.accessToken}`,
               };
            },
            async fetch(url, options) {
               let res = await fetch(url, options);

               if (res.status === 401) {
                  const refreshRes = await $fetch<{
                     accessToken: string;
                     refreshToken: string;
                  }>('/api/refresh');
                  authStore.accessToken = refreshRes.accessToken;
                  authStore.refreshToken = refreshRes.refreshToken;

                  options!.headers = {
                     ...options!.headers,
                     Authorization: `Bearer ${refreshRes.accessToken}`,
                  };
                  res = await fetch(url, options);
               }

               return res;
            },
         }),
      ],
   });

   return {
      provide: {
         trpcClient,
      },
   };
});
