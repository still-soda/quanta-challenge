import { router } from '../../trpc';
import { dailyRouter } from './daily';
import { problemRouter } from './problem';
import { tagRouter } from './tag';

export const publicRouter = router({
   tag: tagRouter,
   problem: problemRouter,
   daily: dailyRouter,
});
