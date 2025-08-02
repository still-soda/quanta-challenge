import prisma from '@challenge/database';
import { publicProcedure, router } from '../../trpc';

const findAllTagsProcedure = publicProcedure.query(async ({ ctx }) => {
   const tags = await prisma.tag.findMany();
   return tags;
});

export const tagRouter = router({
   findAll: findAllTagsProcedure,
});
