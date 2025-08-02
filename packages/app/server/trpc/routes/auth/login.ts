import prisma from '@challenge/database';
import z from 'zod';
import { publicProcedure, router } from '~~/server/trpc/trpc';
import { generateTokens } from '~~/server/utils/jwt';
import { protectedProcedure } from '../../protected-trpc';

const emailLoginInputSchema = z.object({
   email: z.email(),
   password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const emailLoginProcedure = publicProcedure
   .input(emailLoginInputSchema)
   .query(async ({ input }) => {
      const { email, password } = input;

      const authRecord = await prisma.auth.findFirstOrThrow({
         where: {
            provider: 'EMAIL',
            providerId: email,
         },
      });
      const { password: pwdHash } = authRecord;
      if (!pwdHash || !comparePassword(password, pwdHash)) {
         throw new Error('Invalid email or password');
      }

      const user = await prisma.user.findUniqueOrThrow({
         where: { id: authRecord.userId },
         include: { avatar: true },
      });
      const tokens = generateTokens({
         userId: user.id,
         role: user.role,
      });
      return { user, tokens };
   });

const getUserByAccessToken = protectedProcedure.query(async ({ ctx }) => {
   if (!ctx.user) {
      throw new Error('Unauthorized');
   }
   const user = await prisma.user.findUniqueOrThrow({
      where: { id: ctx.user.userId },
      include: { avatar: true },
   });
   prisma.user.update({
      where: { id: ctx.user.userId },
      data: { lastLogin: new Date() },
   });
   return user;
});

export const loginRouter = router({
   email: emailLoginProcedure,
   getUser: getUserByAccessToken,
});
