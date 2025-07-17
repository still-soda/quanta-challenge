import { TRPCError } from '@trpc/server';
import { Context } from '../context';
import { middleware } from '../trpc';

export const requireAuth = middleware(async ({ ctx, next }) => {
   const user = (ctx as Context).user;
   if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
   }

   return next({
      ctx: { user },
   });
});
