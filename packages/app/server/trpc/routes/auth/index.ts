import { router } from '../../trpc';
import { loginRouter } from './login';
import { registerRouter } from './register';

export const authRouter = router({
   login: loginRouter,
   register: registerRouter,
});
