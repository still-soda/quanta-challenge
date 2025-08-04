import { Hono } from 'hono';
import { loadEnv } from '../middlewares/env.js';
import taskRoute from './task.js';
import { globalExpectionFilter } from '../filters/gloabl-expection-filter.js';
import { DockerService } from '../services/docker.js';

const app = new Hono();

app.use('*', loadEnv());

app.onError(globalExpectionFilter);

app.route('/task', taskRoute);

app.get('/', async (c) => {
   const result = await DockerService.instance.startLiveServerContainer({
      '/index.html': '<h1>Welcome to the Judge Service</h1>',
      '/src/index.ts': 'console.log("Judge Service is running");',
   });
   result.waitForReady.then(() => {
      console.log('Live server container is ready');
   });
   return c.text('Judge Service is running');
});

export default app;
