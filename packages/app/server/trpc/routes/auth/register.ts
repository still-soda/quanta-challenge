import z from 'zod';
import { publicProcedure, router } from '../../trpc';
import prisma from '~~/lib/prisma';
import { hashPassword } from '~~/server/utils/password';
import { generateTokens } from '~~/server/utils/jwt';

const emailReisterInputSchema = z
   .object({
      username: z
         .string()
         .min(3, 'Username must be at least 3 characters long'),
      email: z.email(),
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
   .input(emailReisterInputSchema)
   .mutation(async ({ input }) => {
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
                  email: email,
               },
            },
         },
      });
      return {
         tokens: generateTokens({ userId }),
         user: {
            name: username,
            id: userId,
            email,
         },
      };
   });

export const registerRouter = router({
   email: emailRegisterProcedure,
});
