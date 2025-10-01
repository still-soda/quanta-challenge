import { router } from '../../trpc';
import { achievementRouter } from './achievement';
import { imageRouter } from './image';
import { problemRouter } from './problem';
import { tagRouter } from './tag';

export const adminRouter = router({
   problem: problemRouter,
   tag: tagRouter,
   image: imageRouter,
   achievement: achievementRouter,
});
