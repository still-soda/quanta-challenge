import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/trpc/routes/index';

export default defineNuxtPlugin(() => {
   const trpcClient = createTRPCClient<AppRouter>({
      links: [
         httpBatchLink({
            url: '/api/trpc',
         }),
      ],
   });

   return {
      provide: {
         trpcClient,
      },
   };
});
