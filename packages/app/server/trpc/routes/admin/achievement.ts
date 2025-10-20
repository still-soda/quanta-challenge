import prisma from '~~/lib/prisma';
import { protectedAdminProcedure } from '../../protected-trpc';
import { router } from '../../trpc';
import z from 'zod';
import pkg from 'node-sql-parser';
const { Parser } = pkg;
import { contextVariables, invalidFieldsPattern } from '../../configs';
import { TRPCError } from '@trpc/server';
import { realNameFieldsMap, validRealNames } from '@challenge/database';
import { VM } from 'vm2';
import { observer } from '../../services/achievement';

const getAllDepDataLoadersProcedure = protectedAdminProcedure.query(
   async () => {
      const loaders = await prisma.achievementDepDataLoader.findMany({
         select: {
            id: true,
            name: true,
            description: true,
            type: true,
            isList: true,
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

const CreateAchievementSchema = z.object({
   name: z.string().min(1).max(50),
   description: z.string().min(1).max(255),
   imageId: z.uuid(),
   script: z.string().min(1),
   dependencyData: z.array(z.number()),
   preAchievements: z.array(z.number()),
   isCheckinAchievement: z.boolean(),
});

const createAchievementProcedure = protectedAdminProcedure
   .input(CreateAchievementSchema)
   .mutation(async ({ ctx, input }) => {
      const image = await prisma.image.findUnique({
         where: { id: input.imageId },
      });
      if (!image) {
         throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '成就图标不存在',
         });
      }

      const achievementWithSameName = await prisma.achievement.findFirst({
         where: { name: input.name },
      });
      if (achievementWithSameName) {
         throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '存在相同名称的成就，请更换名称',
         });
      }

      const depDataLoaders = await prisma.achievementDepDataLoader.findMany({
         where: { id: { in: input.dependencyData } },
         select: { name: true, type: true },
      });
      if (depDataLoaders.length !== input.dependencyData.length) {
         throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '部分成就依赖数据加载器不存在',
         });
      }

      const { judge } = useRuntimeConfig();
      const { code: checkScript } = await fetch(
         `${judge.serverUrl}/code/extract`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               code: input.script,
            }),
         }
      ).then((res) => res.json());
      if (!checkScript || typeof checkScript !== 'string') {
         throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Check script must export a default function',
         });
      }

      const mockDepData = depDataLoaders.reduce((prev, curr) => {
         prev[curr.name] =
            curr.type === 'BOOLEAN' ? false : curr.type === 'NUMERIC' ? 0 : '';
         return prev;
      }, {} as Record<string, number | boolean | string>);
      const vm = new VM({
         allowAsync: false,
         eval: false,
         wasm: false,
         timeout: 200,
         sandbox: {
            depData: mockDepData,
            defineCheckFunc: (fn: Function) => fn,
         },
      });
      try {
         const scriptToRun = `${checkScript.replace(
            'export default ',
            'const check = '
         )}; check(depData);`;
         vm.run(scriptToRun);
      } catch (err) {
         throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
               '成就检测代码未通过测试：' +
               (err instanceof Error ? err.message : ''),
         });
      }

      try {
         const result = await prisma.achievement.create({
            data: {
               name: input.name,
               badgeImageId: input.imageId,
               description: input.description,
               authorId: ctx.user.userId,
               AchievementValidateScript: {
                  create: {
                     script: input.script,
                  },
               },
               AchievementDependencyData: {
                  createMany: {
                     data: input.dependencyData.map((id) => ({
                        achievementDepDataLoaderId: id,
                     })),
                  },
               },
               CheckinAchievement: {
                  create: {},
               },
               AchievementPreAchievement: {
                  createMany: {
                     data: input.preAchievements.map((id) => ({
                        preAchievementId: id,
                     })),
                  },
               },
            },
            select: {
               id: true,
            },
         });
         // 新增成就需要重建依赖树
         observer.rebuildDepTree();
         return { achievementId: result.id };
      } catch (err: any) {
         throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '成就创建失败：' + err.message,
         });
      }
   });

export const achievementRouter = router({
   getAllDepDataLoaders: getAllDepDataLoadersProcedure,
   requestDepDataLoader: requestDepDataLoaderProcedure,
   createAchievement: createAchievementProcedure,
});
