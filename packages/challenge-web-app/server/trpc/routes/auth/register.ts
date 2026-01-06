import z from 'zod';
import { publicProcedure, router } from '../../trpc';
import { hashPassword } from '~~/server/utils/password';
import { generateTokens } from '~~/server/utils/jwt';
import prisma from '~~/lib/prisma';

const EmailReisterInputSchema = z
   .object({
      username: z
         .string()
         .regex(
            /^[a-zA-Z0-9_]{3,20}$/,
            'Username must be alphanumeric with underscores only'
         )
         .min(3, 'Username must be at least 3 characters long')
         .max(20, 'Username must be at most 20 characters long'),
      email: z.email('Invalid email address'),
      password: z
         .string()
         .min(6, 'Password must be at least 6 characters long'),
      confirmPassword: z
         .string()
         .min(6, 'Confirm Password must be at least 6 characters long'),
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
   });

const emailRegisterProcedure = publicProcedure
   .input(EmailReisterInputSchema)
   .mutation(async ({ input, ctx }) => {
      const { username, email, password } = input;
      const pwdHash = await hashPassword(password);

      const { userId } = await prisma.auth.create({
         data: {
            provider: 'EMAIL',
            providerId: email,
            password: pwdHash,
            email,
            user: {
               create: {
                  name: username,
                  displayName: username,
                  email: email,
                  UserStatistic: {},
               },
            },
         },
      });
      const tokens = generateTokens({ userId, role: 'USER' });
      const csrfToken = crypto.randomUUID();

      const opt = {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax' as any,
      };

      setCookie(ctx.event, 'quanta_access_token', tokens.accessToken, opt);
      setCookie(ctx.event, 'quanta_refresh_token', tokens.refreshToken, opt);
      setCookie(ctx.event, 'quanta_csrf_token', csrfToken, opt);

      return {
         csrfToken,
         user: {
            name: username,
            displayName: username,
            id: userId,
            email,
         },
      };
   });

const ExistingUserRegisterInputSchema = z.object({
   username: z.string(),
});

const existingUserRegisterProcedure = publicProcedure
   .input(ExistingUserRegisterInputSchema)
   .query(async ({ input }) => {
      const { username } = input;

      const existingUser = await prisma.user.findUnique({
         where: { name: username },
      });

      return { exists: !!existingUser };
   });

const ExistingEmailRegisterInputSchema = z.object({
   email: z.string(),
});

const existingEmailRegisterProcedure = publicProcedure
   .input(ExistingEmailRegisterInputSchema)
   .query(async ({ input }) => {
      const { email } = input;

      const existingAuth = await prisma.auth.findUnique({
         where: {
            provider_providerId: { provider: 'EMAIL', providerId: email },
         },
      });

      return { exists: !!existingAuth };
   });

export const registerRouter = router({
   email: emailRegisterProcedure,
   existingUser: existingUserRegisterProcedure,
   existingEmail: existingEmailRegisterProcedure,
});
