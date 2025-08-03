import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const globalExpectionFilter: ErrorHandler = (err) => {
   console.log(err.cause, err.message);
   if (err instanceof HTTPException) {
      return err.getResponse();
   }
   return new HTTPException(500, {
      message: 'Internal Server Error',
      cause: err instanceof Error ? err.message : 'Unknown error',
   }).getResponse();
};
