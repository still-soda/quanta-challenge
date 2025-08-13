import { router } from '../../trpc';
import { problemRouter } from './problem';

export const protectedRouter = router({
   problem: problemRouter,
});
