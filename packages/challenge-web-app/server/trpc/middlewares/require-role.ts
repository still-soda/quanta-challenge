import { UserRole } from '@prisma/client';
import { requireAuth } from './require-auth';
import { TRPCError } from '@trpc/server';

const roleLevelMapping = {
   SUPER_ADMIN: 3,
   ADMIN: 2,
   USER: 1,
} satisfies Record<UserRole, number>;

export const requireRole = (role: UserRole) => {
   const lowerRole = roleLevelMapping[role];
   return requireAuth.unstable_pipe(({ ctx, next }) => {
      const user = ctx.user;
      const roleLevel = roleLevelMapping[user.role];
      if (!user || roleLevel < lowerRole) {
         throw new TRPCError({
            code: 'FORBIDDEN',
            message: `You must have at least ${role} role to access this resource.`,
         });
      }
      return next({
         ctx: { user },
      });
   });
};
