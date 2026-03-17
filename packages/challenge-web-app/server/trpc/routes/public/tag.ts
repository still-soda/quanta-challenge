import prisma from '~~/lib/prisma';
import { publicProcedure, router } from '../../trpc';
import z from 'zod';

// 获取所有标签
const listAllTagsProcedure = publicProcedure.query(async ({ ctx }) => {
   const tags = await prisma.tags.findMany({
      include: {
         image: {
            select: {
               name: true,
            },
         },
      },
   });
   return tags.map((tag) => ({
      ...tag,
      url: tag.image ? `/api/static/${tag.image.name}` : null,
   }));
});

const deleteTagProcedure = publicProcedure
   .input(z.number())
   .mutation(async ({ input }) => {
      return await prisma.tags.delete({
         where: { tid: input }
      });
   });


export const tagRouter = router({
   list: listAllTagsProcedure,
   deleteTag: deleteTagProcedure
});
