import { logger } from '~~/lib/logger';
import { middleware } from '../trpc';

export const log = () => {
   return middleware(async ({ ctx, next }) => {
      const ip = getRequestIP(ctx.event, { xForwardedFor: true });
      const startTime = Date.now();
      const r = await next();

      const duration = Date.now() - startTime;

      if (r.ok) {
         logger.info(
            { event: ctx.event, ip, duration, traceId: ctx.traceId },
            'tRPC request',
         );
      } else {
         logger.error({ ip, duration, error: r.error, ...ctx }, 'tRPC request');
      }

      return r;
   });
};
