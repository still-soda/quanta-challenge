import { Hono } from 'hono';
import { zValidator } from '../utils/validator.js';
import { CompileSchema } from '../schemas/compile.js';
import { CompileService } from '../services/compile.js';

const codeRoute = new Hono();

codeRoute.post('/extract', zValidator('json', CompileSchema), async (c) => {
   const payload = c.req.valid('json');

   const compiledCode = CompileService.instance.extractDefaultExport(
      payload.code
   );

   return c.json({ code: compiledCode }, 200);
});

export default codeRoute;
