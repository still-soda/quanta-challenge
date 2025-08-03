import z from 'zod';
import { protectedAdminProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import { useStore } from '../../store';
import prisma from '@challenge/database';

const UploadImageSchema = z.object({
   fileBase64: z.base64().refine(
      (fileb64) => {
         const size = Buffer.byteLength(fileb64, 'base64');
         return size <= 5 * 1024 * 1024; // 5MB limit
      },
      { error: 'File size must be less than 5MB' }
   ),
   fileName: z.string(),
});

const uploadImageProcedure = protectedAdminProcedure
   .input(UploadImageSchema)
   .mutation(async ({ ctx, input }) => {
      const { fileBase64, fileName } = input;
      const fileBuffer = Buffer.from(fileBase64, 'base64');
      const store = useStore();
      const fileId = await store.save(fileBuffer, fileName);
      const fileUrl = await store.url(fileId);
      return await prisma.image.create({
         data: {
            id: fileId,
            url: fileUrl,
            UserImage: {
               create: {
                  userId: ctx.user.userId,
               },
            },
         },
      });
   });

export const imageRouter = router({
   upload: uploadImageProcedure,
});
