import { router } from '../../trpc';
import { problemRouter } from './problem';

export const adminRouter = router({
   problem: problemRouter,
});
