import { verifyOpenApiSign } from '@challenge/shared/openapi';
import z from 'zod';
import { logger } from '~~/lib/logger';

export default defineEventHandler((event) => {
   if (!event.path.startsWith('/api/webhooks/')) return;

   const timestamp = getCookie(event, 'webhook_timestamp');
   if (!timestamp) {
      logger.warn('Webhook authentication failed: missing timestamp', {
         path: event.path,
      });
      throw createError({
         statusCode: 403,
         message: 'Missing webhook timestamp',
      });
   }

   const sign = getCookie(event, 'sign');
   if (!sign) {
      logger.warn('Webhook authentication failed: missing signature', {
         path: event.path,
      });
      throw createError({
         statusCode: 403,
         message: 'Missing webhook signature',
      });
   }

   const { openapi } = useRuntimeConfig();
   const query = getQuery(event);
   const uri = event.path.split('?')[0];

   const verified = verifyOpenApiSign({
      params: query,
      secret: openapi.webhookSecret,
      path: uri,
      signature: sign,
      timestamp: timestamp,
   });

   if (!verified) {
      logger.warn('Webhook authentication failed', { path: event.path, query });
      throw createError({
         statusCode: 403,
         message: 'Invalid webhook signature',
      });
   }
});
