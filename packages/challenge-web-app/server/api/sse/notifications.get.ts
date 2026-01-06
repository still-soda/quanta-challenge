import { notificationEmitter } from '../../utils/event-emitter';

export default defineEventHandler(async (event) => {
   const token = getCookie(event, 'quanta_access_token');

   if (!token) {
      throw createError({
         status: 401,
         statusMessage: 'Unauthorized',
         message: 'Invalid token',
      });
   }

   let user: ITokenPayload;
   try {
      user = verifyToken(token);
   } catch (error) {
      throw createError({
         status: 401,
         statusMessage: 'Unauthorized',
         message: 'Invalid token',
      });
   }

   const unsubscribe = notificationEmitter.on('new', ({ userIds }) => {
      if (!userIds.has(user.userId)) return;

      event.node.res.write(
         `data: ${JSON.stringify({ message: 'new_notification' })}\n\n`
      );
   });

   event.node.res.setHeader('Content-Type', 'text/event-stream');
   event.node.res.setHeader('Cache-Control', 'no-cache');
   event.node.res.setHeader('Connection', 'keep-alive');

   event.node.req.on('close', unsubscribe);

   // Initial ping to establish the connection
   event.node.res.write(
      `data: ${JSON.stringify({ message: 'connected' })}\n\n`
   );
});
