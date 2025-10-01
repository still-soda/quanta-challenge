import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/trpc/routes/index';
import useAuthStore from '~/stores/auth-store';
import { useMessageOutsideVue } from '~/components/st/Message/use-message';

export default defineNuxtPlugin(() => {
   const authStore = useAuthStore();

   const baseUrl = import.meta.server ? process.env.API_BASE_URL : '';

   const trpc = createTRPCClient<AppRouter>({
      links: [
         httpBatchLink({
            url: baseUrl + '/api/trpc',
            headers() {
               if (!authStore.accessToken) return {};
               return {
                  Authorization: `Bearer ${authStore.accessToken}`,
               };
            },
            async fetch(url, options: any) {
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
                     authStore.setTokens(refreshRes);

                     options!.headers = {
                        ...options!.headers,
                        Authorization: `Bearer ${refreshRes.accessToken}`,
                     };
                     res = await fetch(url, options);

                     if (res.status.toString().startsWith('5')) {
                        const message = useMessageOutsideVue();
                        message.error('服务器错误，请稍后重试');
                     }
                  } catch {
                     location.replace(
                        '/auth/login?redirect=' +
                           encodeURIComponent(useRoute().fullPath)
                     );
                     return res;
                  }
               } else if (res.status.toString().startsWith('5')) {
                  const message = useMessageOutsideVue();
                  message.error('服务器错误，请稍后重试');
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
