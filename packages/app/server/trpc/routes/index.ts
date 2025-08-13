import { router } from '../trpc';
import { adminRouter } from './admin';
import { authRouter } from './auth';
import { protectedRouter } from './protected';
import { publicRouter } from './public';

export const appRouter = router({
   auth: authRouter,
   admin: adminRouter,
   public: publicRouter,
   protected: protectedRouter,
});

export type AppRouter = typeof appRouter;
