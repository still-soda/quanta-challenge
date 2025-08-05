import { serve } from '@hono/node-server';
import { app, injectWebSocket } from './controllers/index.js';
import { JudgeService } from './services/judge.js';
import { PlaywrightService } from './services/playwright.js';

JudgeService.instance.init();
PlaywrightService.instance.init(1);

const server = serve(
   {
      fetch: app.fetch,
      port: 3000,
      hostname: '0.0.0.0',
   },
   (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
   }
);
injectWebSocket(server);
