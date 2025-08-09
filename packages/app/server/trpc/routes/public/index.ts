import { router } from '../../trpc';
import { problemRouter } from './problem';
import { tagRouter } from './tag';

export const publicRouter = router({
   tag: tagRouter,
   problem: problemRouter,
});
