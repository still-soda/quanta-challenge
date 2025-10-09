import { requestContext } from './context';
import { injectInfo } from './middlewares/inject-info';
import { requireAuth } from './middlewares/require-auth';
import { requireRole } from './middlewares/require-role';
import { publicProcedure } from './trpc';

export const protectedProcedure = publicProcedure
   .use(requireAuth)
   .use(injectInfo);

export const protectedAdminProcedure = publicProcedure
   .use(requireRole('ADMIN'))
   .use(injectInfo);

export const protectedSuperAdminProcedure = publicProcedure
   .use(requireRole('SUPER_ADMIN'))
   .use(injectInfo);
