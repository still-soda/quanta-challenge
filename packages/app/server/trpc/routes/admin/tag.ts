import prisma from '@challenge/database';
import { protectedAdminProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import z from 'zod';

const hexRegex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/i;

const AddTagSchema = z.object({
   name: z.string().min(1, 'Tag name is required'),
   color: z
      .string('Color must be a valid hex code')
      .regex(hexRegex, 'Color must be a valid hex code')
      .default('#FA7C0C'),
   description: z.string().optional(),
   imageId: z.string().optional(),
});

const addTagProcedure = protectedAdminProcedure
   .input(AddTagSchema)
   .mutation(async ({ ctx, input }) => {
      const tag = await prisma.tag.create({
         data: {
            name: input.name,
            color: input.color,
            description: input.description,
            creator: {
               connect: {
                  id: ctx.user.userId,
               },
            },
            image: {
               connect: {
                  id: input.imageId,
               },
            },
         },
      });
      await prisma.image.update({
         where: { id: input.imageId },
         data: {
            refCount: {
               increment: 1,
            },
         },
      });
      return tag;
   });

const EditTagSchema = AddTagSchema.partial().extend({
   tid: z.number().int().nonnegative().min(1, 'Tag ID is required'),
});

const editTagProcedure = protectedAdminProcedure
   .input(EditTagSchema)
   .mutation(async ({ ctx, input }) => {
      const tag = await prisma.tag.update({
         where: { tid: input.tid },
         data: {
            ...input,
         },
      });
      return tag;
   });

const DeleteTagSchema = z.object({
   tid: z.number().int().nonnegative().min(1, 'Tag ID is required'),
});

const deleteTagProcedure = protectedAdminProcedure
   .input(DeleteTagSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const tag = await prisma.tag.delete({
         where: {
            tid: input.tid,
            creatorId: userId,
         },
      });
      return tag;
   });

export const tagRouter = router({
   add: addTagProcedure,
   edit: editTagProcedure,
   delete: deleteTagProcedure,
});
