import { middleware } from '../trpc';

export const limitRequest = middleware(async ({ ctx, next }) => {
   return next();
});
