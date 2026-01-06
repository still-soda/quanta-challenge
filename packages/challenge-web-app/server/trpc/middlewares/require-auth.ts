import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc';

export const requireAuth = middleware(async ({ ctx, next }) => {
   const user = ctx.user;
   if (!user) {
      throw new TRPCError({
         code: 'UNAUTHORIZED',
         message: 'Required authentication',
      });
   }

   return next({
      ctx: { user },
   });
});
