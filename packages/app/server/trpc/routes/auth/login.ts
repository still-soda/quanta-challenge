import z from 'zod';
import prisma from '~~/lib/prisma';
import { publicProcedure, router } from '~~/server/trpc/trpc';
import { generateTokens } from '~~/server/utils/jwt';

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
      const tokens = generateTokens({ userId: user.id });
      return { user, tokens };
   });

export const loginRouter = router({
   email: emailLoginProcedure,
});
