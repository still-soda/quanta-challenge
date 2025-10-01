import prisma from '@challenge/database';
import { protectedAdminProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import z from 'zod';
import pkg from 'node-sql-parser';
const { Parser } = pkg;
import { whiteTableList } from '../../configs';
import { TRPCError } from '@trpc/server';

const getAllDepDataLoadersProcedure = protectedAdminProcedure.query(
   async () => {
      const loaders = await prisma.achievementDepDataLoader.findMany({
         select: {
            id: true,
            name: true,
            description: true,
            type: true,
         },
      });

      return loaders;
   }
);

const RequestDepDataLoaderSchema = z.object({
   name: z.string().min(1).max(50),
   description: z.string().min(1).max(255),
   type: z.enum(['NUMERIC', 'BOOLEAN', 'TEXT']),
   sql: z.string().min(1),
});

const requestDepDataLoaderProcedure = protectedAdminProcedure
   .input(RequestDepDataLoaderSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const parser = new Parser();
      try {
         parser.whiteListCheck(input.sql, whiteTableList, {
            database: 'Postgresql',
         });
      } catch (error: any) {
         await prisma.achievementDependencyDataRequestRecord.create({
            data: {
               userId,
               success: false,
               reason: error.message,
               sql: input.sql,
               name: input.name,
            },
         });
         throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'SQL 语法错误或包含不允许的表名和关键字',
         });
      }

      await prisma.achievementDependencyDataRequestRecord.create({
         data: {
            userId,
            success: true,
            sql: input.sql,
            name: input.name,
         },
      });

      const newLoader = await prisma.achievementDepDataLoader.create({
         data: {
            name: input.name,
            description: input.description,
            type: input.type,
            sql: input.sql,
         },
      });

      return newLoader;
   });

export const achievementRouter = router({
   getAllDepDataLoaders: getAllDepDataLoadersProcedure,
   requestDepDataLoader: requestDepDataLoaderProcedure,
});
