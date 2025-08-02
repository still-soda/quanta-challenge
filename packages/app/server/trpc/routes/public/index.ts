import { router } from '../../trpc';
import { tagRouter } from './tag';

export const publicRouter = router({
   tag: tagRouter,
});
