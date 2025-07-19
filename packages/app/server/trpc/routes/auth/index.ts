import { router } from '../../trpc';
import { authnRouter } from './authn';
import { loginRouter } from './login';
import { registerRouter } from './register';

export const authRouter = router({
   login: loginRouter,
   register: registerRouter,
   authn: authnRouter,
});
