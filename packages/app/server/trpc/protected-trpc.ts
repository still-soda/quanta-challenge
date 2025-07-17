import { requireAuth } from './middlewares/require-auth';
import { publicProcedure } from './trpc';

export const protectedProcedure = publicProcedure.use(requireAuth);
