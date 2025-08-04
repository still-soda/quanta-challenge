import { serve } from '@hono/node-server';
import app from './controllers/index.js';
import { QueueService } from './services/queue.js';
import { RedisService } from './services/redis.js';
import { DockerService } from './services/docker.js';
import { judgeProcessor } from './services/judge-processor.js';

QueueService.instance.initWorkers('judge-task', judgeProcessor, 3);
await DockerService.instance.init();

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
   DockerService.instance.destroy();
});
