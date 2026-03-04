import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc';
import { logger } from '~~/lib/logger';

export const limitRequest = (timesPerMinute: number) => {
   return middleware(async ({ ctx, next }) => {
      const ip = getRequestIP(ctx.event, { xForwardedFor: true });
      const redis = useRedis();

      const key = `req_limit:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
         await redis.expire(key, 60);
      }

      if (count > timesPerMinute) {
         logger.warn(
            `IP ${ip} has made ${count} requests in the last minute, exceeding the limit of ${timesPerMinute}.`,
         );
         throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests',
         });
      }

      return next();
   });
};
