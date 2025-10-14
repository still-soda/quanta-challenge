import z from 'zod';
import { protectedProcedure } from '../../protected-trpc';
import prisma from '~~/lib/prisma';
import { projectService } from '../../services/project';
import { router } from '../../trpc';
import { TRPCError } from '@trpc/server';

// 获取或创建项目
const GetOrForkProjectSchema = z.object({
   problemId: z.number('Project ID must be a number'),
});

const getOrForkProjectProcedure = protectedProcedure
   .input(GetOrForkProjectSchema)
   .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const project = await prisma.projects.findFirst({
         where: {
            ownerId: userId,
            problemId: input.problemId,
         },
         include: {
            FileSystem: {
               include: {
                  files: true,
               },
            },
         },
      });
      if (project) {
         return project;
      }

      const templateProject = await prisma.projects.findFirstOrThrow({
         where: {
            problemId: input.problemId,
            isTemplate: true,
         },
         select: { pid: true },
      });
      const templateProjectId = templateProject.pid;

      const { projectId } = await projectService.fork({
         projectId: templateProjectId,
         isTemplate: false,
         userId: userId,
      });

      const result = await prisma.projects.findUniqueOrThrow({
         where: {
            pid: projectId,
         },
         include: {
            FileSystem: {
               include: {
                  files: true,
               },
            },
         },
      });
      return result;
   });

// 获取问题详情
const GetProblemDetailSchema = z.object({
   problemId: z.number('Problem ID must be a number'),
});

const getProblemDetailProcedure = protectedProcedure
   .input(GetProblemDetailSchema)
   .query(async ({ input }) => {
      const problem = await prisma.problems.findUnique({
         where: {
            pid: input.problemId,
            isDeprecated: false,
         },
         include: {
            CoverImage: {
               select: { name: true },
            },
            ProblemDefaultCover: {
               select: { image: { select: { name: true } } },
               take: 1,
            },
         },
      });
      if (!problem) {
         throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Problem not found',
         });
      }
      const imageName =
         problem.CoverImage?.name ??
         problem.ProblemDefaultCover?.[0]?.image.name ??
         null;
      return { ...problem, coverImageName: imageName };
   });

// 提交答案
const CommitAnswerSchema = z.object({
   problemId: z.number('Problem ID must be a number'),
   snapshot: z.record(z.string(), z.string(), 'Invalid snapshot format'),
});

const commitAnswerProcedure = protectedProcedure
   .input(CommitAnswerSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const { judge } = useRuntimeConfig();

      let createdJudgeRecordId: number = -1;
      await prisma.$transaction(async (tx) => {
         // 创建判题记录
         const { id: judgeRecordId } = await tx.judgeRecords.create({
            data: {
               type: 'judge',
               problemId: input.problemId,
               userId: userId,
               info: {},
            },
            select: {
               id: true,
            },
         });
         createdJudgeRecordId = judgeRecordId;

         const { JudgeFile } = await tx.problems.findUniqueOrThrow({
            where: {
               pid: input.problemId,
            },
            select: {
               JudgeFile: {
                  select: {
                     judgeScript: true,
                  },
               },
            },
         });
         const judgeScript = JudgeFile[0].judgeScript;

         // 生成回调 token
         const callbackToken = crypto.randomUUID();
         const redis = useRedis();
         redis.set(`judge_token:${judgeRecordId}`, callbackToken);

         await fetch(`${judge.serverUrl}/task/create`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               userId: userId,
               judgeRecordId: judgeRecordId,
               judgeScript: judgeScript,
               fsSnapshot: input.snapshot,
               problemId: input.problemId,
               token: callbackToken,
               mode: 'judge',
            }),
         }).then((res: any) => {
            if (!res.ok) {
               throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `Failed to create task: ${res.message}`,
               });
            }
         });
      });

      return {
         success: true,
         judgeRecordId: createdJudgeRecordId,
      };
   });

// 获取所有提交记录
const GetAllCommitRecordsSchema = z.object({
   problemId: z.number('Problem ID must be a number'),
});

const getAllCommitRecordsProcedure = protectedProcedure
   .input(GetAllCommitRecordsSchema)
   .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const records = await prisma.judgeRecords.findMany({
         where: {
            userId: userId,
            problemId: input.problemId,
            type: 'judge',
         },
         select: {
            id: true,
            result: true,
            createdAt: true,
         },
         orderBy: {
            createdAt: 'desc',
         },
      });
      return records;
   });

// 获取详情
const GetCommitRecordDetailSchema = z.object({
   judgeRecordId: z.number('Judge Record ID must be a number'),
});

const getCommitRecordDetailProcedure = protectedProcedure
   .input(GetCommitRecordDetailSchema)
   .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const record = await prisma.judgeRecords.findFirst({
         where: {
            id: input.judgeRecordId,
            userId: userId,
         },
         select: {
            id: true,
            result: true,
            info: true,
            judgingTime: true,
            score: true,
            pendingTime: true,
            createdAt: true,
            problem: {
               select: {
                  pid: true,
                  title: true,
               },
            },
            user: {
               select: {
                  name: true,
                  avatar: true,
               },
            },
         },
      });
      if (!record) {
         throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Record not found',
         });
      }
      return record;
   });

const getCommitStatisticProcedure = protectedProcedure.query(
   async ({ ctx }) => {
      const { userId } = ctx.user;

      return await prisma.userStatistic.findUnique({
         where: { userId },
         select: {
            correctRate: true,
            passCount: true,
            score: true,
         },
      });
   }
);

export const problemRouter = router({
   getOrForkProject: getOrForkProjectProcedure,
   getProblemDetail: getProblemDetailProcedure,
   commitAnswer: commitAnswerProcedure,
   getAllCommitRecords: getAllCommitRecordsProcedure,
   getCommitRecordDetail: getCommitRecordDetailProcedure,
   getCommitStatistic: getCommitStatisticProcedure,
});
