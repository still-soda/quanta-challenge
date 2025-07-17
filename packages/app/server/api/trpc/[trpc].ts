import { createTRPCNuxtHandler } from 'trpc-nuxt/server';
import { appRouter } from '~~/server/trpc/routes';

export default createTRPCNuxtHandler({
   router: appRouter,
});
