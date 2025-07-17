import { router } from '../../trpc';
import { loginRouter } from './login';

export const authRouter = router({
   login: loginRouter,
});
