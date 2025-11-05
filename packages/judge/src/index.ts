import { serve } from '@hono/node-server';
import app from './controllers/index.js';
import { initMq } from './mq/index.js';
import { destroyServices, initServices } from './services/index.js';

await initMq();
await initServices();

const port = Number(process.env.PORT ?? 3000);

try {
   serve({ fetch: app.fetch, port })
      .once('close', destroyServices)
      .once('listening', () => {
         console.log(`[INFO] Server is running on http://localhost:${port}`);
      });
} catch (error) {
   console.error(
      `服务器启动失败，请检查 [:${port}] 端口是否被占用\n[ERROR] ${error}`
   );
}
