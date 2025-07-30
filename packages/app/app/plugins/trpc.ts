import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/trpc/routes/index';
import useAuthStore from '~/stores/auth-store';

export default defineNuxtPlugin(() => {
   const authStore = useAuthStore();

   const trpc = createTRPCClient<AppRouter>({
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
                  try {
                     if (!authStore.refreshToken) {
                        throw new Error('No refresh token available');
                     }

                     const refreshRes = await $fetch<{
                        accessToken: string;
                        refreshToken: string;
                     }>('/api/refresh', {
                        headers: { refreshToken: authStore.refreshToken },
                     });
                     authStore.accessToken = refreshRes.accessToken;
                     authStore.refreshToken = refreshRes.refreshToken;

                     options!.headers = {
                        ...options!.headers,
                        Authorization: `Bearer ${refreshRes.accessToken}`,
                     };
                     res = await fetch(url, options);
                  } catch {
                     navigateTo('/auth/login');
                     return new Response(
                        JSON.stringify({ error: 'Unauthorized' }),
                        {
                           status: 200,
                           headers: { 'Content-Type': 'application/json' },
                        }
                     );
                  }
               }

               return res;
            },
         }),
      ],
   });

   return {
      provide: {
         trpc,
      },
   };
});
