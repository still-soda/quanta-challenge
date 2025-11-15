import { router } from '../../trpc';
import { achievementRouter } from './achievement';
import { dailyRouter } from './daily';
import { dashboardRouter } from './dashboard';
import { problemRouter } from './problem';
import { rankRouter } from './rank';
import { userRouter } from './user';
import { searchRouter } from './search';
import { fileSyncRouter } from './file-sync';

export const protectedRouter = router({
   problem: problemRouter,
   rank: rankRouter,
   dashboard: dashboardRouter,
   daily: dailyRouter,
   achievement: achievementRouter,
   user: userRouter,
   search: searchRouter,
   fileSync: fileSyncRouter,
});
