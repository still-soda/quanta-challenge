import prisma from '@challenge/database';
import { publicProcedure, router } from '../../trpc';

const findAllTagsProcedure = publicProcedure.query(async ({ ctx }) => {
   const tags = await prisma.tag.findMany({
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

export const tagRouter = router({
   findAll: findAllTagsProcedure,
});
