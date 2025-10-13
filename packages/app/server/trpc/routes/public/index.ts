import { router } from '../../trpc';
import { dailyRouter } from './daily';
import { problemRouter } from './problem';
import { rankRouter } from './rank';
import { tagRouter } from './tag';

export const publicRouter = router({
   tag: tagRouter,
   problem: problemRouter,
   daily: dailyRouter,
   rank: rankRouter,
});
