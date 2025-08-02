import { router } from '../trpc';
import { adminRouter } from './admin';
import { authRouter } from './auth';
import { publicRouter } from './public';

export const appRouter = router({
   auth: authRouter,
   admin: adminRouter,
   public: publicRouter,
});

export type AppRouter = typeof appRouter;
