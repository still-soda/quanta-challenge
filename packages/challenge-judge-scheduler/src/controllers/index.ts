import { Hono } from 'hono';
import { loadEnv } from '../middlewares/env.js';
import taskRoute from './task.js';
import codeRoute from './code.js';
import { globalExpectionFilter } from '../filters/gloabl-expection-filter.js';

const app = new Hono();

app.use('*', loadEnv());

app.onError(globalExpectionFilter);

app.route('/task', taskRoute);
app.route('/code', codeRoute);

app.get('/health', (c) => {
   return c.json({ status: 'ok' });
});

export default app;
