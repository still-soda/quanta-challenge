import { Hono } from 'hono';
import { zValidator } from '../utils/validator';
import { CompileSchema } from '../schemas/compile';
import { CompileService } from '../services/compile';

const codeRoute = new Hono();

codeRoute.post('/extract', zValidator('json', CompileSchema), async (c) => {
   const payload = c.req.valid('json');

   const compiledCode = CompileService.instance.extractDefaultExport(
      payload.code
   );

   return c.json({ code: compiledCode }, 200);
});

export default codeRoute;
