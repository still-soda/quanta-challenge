import { serve } from '@hono/node-server';
import app from './routes/index.js';
import { QueueService } from './services/queue.js';
import { RedisService } from './services/redis.js';

const server = serve(
   {
      fetch: app.fetch,
      port: Number(process.env.PORT ?? 3000),
   },
   (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
   }
);

server.on('close', () => {
   QueueService.instance.destroy();
   RedisService.instance.destroy();
});
