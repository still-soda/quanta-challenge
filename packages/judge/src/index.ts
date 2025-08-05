import { serve } from '@hono/node-server';
import app from './controllers/index.js';
import { initMq } from './mq/index.js';
import { destroyServices, initServices } from './services/index.js';

await initMq();
await initServices();

const server = serve(
   {
      fetch: app.fetch,
      port: Number(process.env.PORT ?? 3000),
   },
   (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
   }
);

server.on('close', async () => {
   await destroyServices();
});
