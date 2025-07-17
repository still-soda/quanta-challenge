import { router } from '~~/server/trpc/trpc';
import { emailLoginProcedure } from './email';

export const loginRouter = router({
   email: emailLoginProcedure,
});
