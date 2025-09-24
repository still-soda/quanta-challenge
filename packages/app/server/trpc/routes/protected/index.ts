import { router } from '../../trpc';
import { dashboardRouter } from './dashboard';
import { problemRouter } from './problem';
import { rankRouter } from './rank';

export const protectedRouter = router({
   problem: problemRouter,
   rank: rankRouter,
   dashboard: dashboardRouter,
});
