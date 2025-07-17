import z from 'zod';
import { publicProcedure } from '../../../trpc';
import { comparePassword } from '~~/server/utils/use-password';
import prisma from '../../../../../lib/prisma';

export const emailLoginProcedure = publicProcedure
   .input(
      z.object({
         email: z.email(),
         password: z
            .string()
            .min(6, 'Password must be at least 6 characters long'),
      })
   )
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
         omit: { lastLogin: true, createdAt: true, updatedAt: true },
         include: { avatar: true },
      });
      return { user };
   });
