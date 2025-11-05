import prisma from '~~/lib/prisma';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import z from 'zod';

const getUserInfoProcedure = protectedProcedure.query(async ({ ctx }) => {
   const { userId } = ctx.user;

   const result = await prisma.userInfo.findUnique({
      where: {
         userId,
      },
      include: {
         bannerImage: {
            select: {
               name: true,
            },
         },
      },
   });

   return {
      ...result,
      bannerImageUrl: result?.bannerImage?.name
         ? `/api/static/${result?.bannerImage?.name}`
         : null,
   };
});

const UpdateUserInfoSchema = z.object({
   bio: z.string().max(500).optional(),
   email: z.string().email().optional().or(z.literal('')),
   major: z.string().max(100).optional(),
   identifier: z.string().max(100).optional(),
   birthday: z.string().optional(),
   bannerImageId: z.string().optional(),
});

const updateUserInfoProcedure = protectedProcedure
   .input(UpdateUserInfoSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      // 处理生日字段
      const birthdayData = input.birthday
         ? { birthday: new Date(input.birthday) }
         : {};

      // 检查用户信息是否存在
      const existingUserInfo = await prisma.userInfo.findUnique({
         where: { userId },
      });

      if (existingUserInfo) {
         // 更新现有记录
         const result = await prisma.userInfo.update({
            where: { userId },
            data: {
               bio: input.bio,
               email: input.email || null,
               major: input.major,
               identifier: input.identifier,
               bannerImageId: input.bannerImageId || null,
               ...birthdayData,
            },
         });
         return result;
      } else {
         // 创建新记录
         const result = await prisma.userInfo.create({
            data: {
               userId,
               bio: input.bio,
               email: input.email || null,
               major: input.major,
               identifier: input.identifier,
               bannerImageId: input.bannerImageId || null,
               ...birthdayData,
            },
         });
         return result;
      }
   });

export const userRouter = router({
   getUserInfo: getUserInfoProcedure,
   updateUserInfo: updateUserInfoProcedure,
});
