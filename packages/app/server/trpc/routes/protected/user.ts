import prisma from '~~/lib/prisma';
import { protectedProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import { useStore } from '../../store';
import z from 'zod';
import path from 'path';

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
         user: {
            select: {
               imageId: true,
               avatar: {
                  select: {
                     name: true,
                  },
               },
            },
         },
      },
   });

   return {
      ...result,
      bannerImageUrl: result?.bannerImage?.name
         ? `/api/static/${result?.bannerImage?.name}`
         : null,
      avatarUrl: result?.user?.avatar?.name
         ? `/api/static/${result?.user?.avatar?.name}`
         : null,
      avatarImageId: result?.user?.imageId || null,
   };
});

const UpdateUserInfoSchema = z.object({
   bio: z.string().max(500).optional(),
   email: z.string().email().optional().or(z.literal('')),
   major: z.string().max(100).optional(),
   identifier: z.string().max(100).optional(),
   birthday: z.string().optional(),
   bannerImageId: z.string().optional(),
   avatarImageId: z.string().optional(),
});

const updateUserInfoProcedure = protectedProcedure
   .input(UpdateUserInfoSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      // 处理生日字段
      const birthdayData = input.birthday
         ? { birthday: new Date(input.birthday) }
         : {};

      // 如果提供了头像，更新 User 表
      if (input.avatarImageId !== undefined) {
         await prisma.user.update({
            where: { id: userId },
            data: {
               imageId: input.avatarImageId || null,
            },
         });
      }

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

const UploadImageSchema = z.object({
   fileBase64: z
      .string()
      .base64()
      .refine(
         (fileb64) => {
            const size = Buffer.byteLength(fileb64, 'base64');
            return size <= 5 * 1024 * 1024; // 5MB limit
         },
         { message: '文件大小不能超过 5MB' }
      ),
   fileName: z.string(),
});

const uploadImageProcedure = protectedProcedure
   .input(UploadImageSchema)
   .mutation(async ({ ctx, input }) => {
      const { fileBase64, fileName } = input;
      const { userId } = ctx.user;

      // 验证文件类型
      const ext = path.extname(fileName).toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowedExtensions.includes(ext)) {
         throw new Error('不支持的文件类型，仅支持 JPG、PNG、GIF 和 WEBP 格式');
      }

      const fileBuffer = Buffer.from(fileBase64, 'base64');
      const store = useStore();
      const fileId = await store.save(fileBuffer, fileName);

      return await prisma.image.create({
         data: {
            id: fileId,
            name: `${fileId}${ext}`,
            UserImage: {
               create: {
                  userId,
               },
            },
         },
         select: {
            id: true,
            name: true,
         },
      });
   });

export const userRouter = router({
   getUserInfo: getUserInfoProcedure,
   updateUserInfo: updateUserInfoProcedure,
   uploadImage: uploadImageProcedure,
});
