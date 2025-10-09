import { TRPCError } from '@trpc/server';
import { Context, requestContext } from '../context';
import { middleware } from '../trpc';

export const injectInfo = middleware(async ({ ctx, next }) => {
   const user = (ctx as Context).user;
   if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
   }

   return requestContext.run({ userId: user.userId }, () => next());
});
