import z from 'zod';
import { protectedAdminProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import { useStore } from '../../store';
import prisma from '@challenge/database';

const UploadImageSchema = z.object({
   file: z.instanceof(File).refine((file) => file.size < 5 * 1024 * 1024, {
      message: 'File size must be less than 5MB',
   }),
});

const uploadImageProcedure = protectedAdminProcedure
   .input(UploadImageSchema)
   .mutation(async ({ ctx, input }) => {
      const { file } = input;
      const store = useStore();
      const fileId = await store.save(file);
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
