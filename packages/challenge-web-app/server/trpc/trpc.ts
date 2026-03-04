import { initTRPC } from '@trpc/server';
import { Context } from './context';
import { log } from './middlewares/log';
import z, { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
   errorFormatter({ shape, error, ctx }) {
      return {
         ...shape,
         data: {
            ...shape.data,
            traceId: ctx?.traceId ?? 'unknown',
            zodError:
               error.cause instanceof ZodError
                  ? z.treeifyError(error.cause)
                  : null,
            stack:
               process.env.NODE_ENV === 'development'
                  ? shape.data.stack
                  : undefined,
         },
      };
   },
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure.use(log());
