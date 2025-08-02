import { requireAuth } from './middlewares/require-auth';
import { requireRole } from './middlewares/require-role';
import { publicProcedure } from './trpc';

export const protectedProcedure = publicProcedure.use(requireAuth);

export const protectedAdminProcedure = publicProcedure.use(
   requireRole('ADMIN')
);

export const protectedSuperAdminProcedure = publicProcedure.use(
   requireRole('SUPER_ADMIN')
);
