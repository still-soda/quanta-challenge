import prisma from '~~/lib/prisma';
import { protectedAdminProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import z from 'zod';
import pkg from 'node-sql-parser';
const { Parser } = pkg;
import { contextVariables, invalidFieldsPattern } from '../../configs';
import { TRPCError } from '@trpc/server';
import { realNameFieldsMap, validRealNames } from '@challenge/database';

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
         const columnList = parser.columnList(input.sql);
         const columnListSegments = columnList.map((col) => col.split('::'));

         const hasInvalidOperation = columnListSegments.some(
            ([op]) => op !== 'select'
         );
         if (hasInvalidOperation) {
            throw new TRPCError({
               code: 'BAD_REQUEST',
               message: 'SQL 语句中只能包含 SELECT 操作',
            });
         }

         const unlimitedColRefs = columnListSegments
            .filter(([, table]) => table === 'null')
            .map(([, , field]) => field);
         if (unlimitedColRefs.length > 0) {
            throw new TRPCError({
               code: 'BAD_REQUEST',
               message:
                  'SQL 语句中包含未限定的列引用，请使用表别名或表名限定列名。不合法的列名: ' +
                  Array.from(new Set(unlimitedColRefs)).join(', '),
            });
         }

         const validRealNamesSet = new Set<string>(validRealNames).add('__ctx');
         const invalidTables = columnListSegments
            .map(([, table]) => table)
            .filter((table) => !validRealNamesSet.has(table as any));
         if (invalidTables.length > 0) {
            throw new TRPCError({
               code: 'BAD_REQUEST',
               message:
                  'SQL 语句中包含不允许的表名，请检查表名是否正确。不合法的表名: ' +
                  Array.from(new Set(invalidTables)).join(', '),
            });
         }

         const contextSet = new Set(contextVariables);
         const invalidFields = columnListSegments
            .filter(([, table, field]) => {
               const notExist =
                  table === '__ctx'
                     ? !contextSet.has(field)
                     : !(realNameFieldsMap as any)[table].has(field);
               const invalidPath = invalidFieldsPattern.some((pattern) =>
                  typeof pattern === 'string'
                     ? pattern === `${table}.${field}`
                     : pattern.test(`${table}.${field}`)
               );
               return notExist || invalidPath;
            })
            .map(([, table, field]) => `${table}.${field}`);
         if (invalidFields.length > 0) {
            throw new TRPCError({
               code: 'BAD_REQUEST',
               message:
                  'SQL 语句中包含不合法的数据路径，请检查字段名是否正确或是否包含敏感字段。不合法的数据路径: ' +
                  Array.from(new Set(invalidFields)).join(', '),
            });
         }
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

         if (error instanceof TRPCError) {
            throw error;
         } else {
            throw new TRPCError({
               code: 'BAD_REQUEST',
               message: 'SQL 语法错误或包含不允许的表名和关键字',
            });
         }
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
