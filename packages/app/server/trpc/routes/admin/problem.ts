import prisma from '@challenge/database';
import { protectedAdminProcedure } from '../../protected-trpc';
import { PublishSchema } from '../../schemas/publish-schema';
import { router } from '../../trpc';
import { IFile, projectService } from '../../services/project';
import z from 'zod';

const uploadProcedure = protectedAdminProcedure
   .input(PublishSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const { judge } = useRuntimeConfig();

      const { code: judgeScript } = await fetch(
         `${judge.serverUrl}/code/extract`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               code: input.judgeScript,
            }),
         }
      ).then((res) => res.json());
      if (!judgeScript || typeof judgeScript !== 'string') {
         throw new Error('Judge script must export a default function');
      }

      let problemId: number | undefined;

      await prisma.$transaction(async (tx) => {
         // 创建问题
         const problem = await tx.problem.create({
            data: {
               title: input.title,
               detail: input.detail,
               difficulty: input.difficulty,
               totalScore: input.totalScore,
               status: 'draft',
               coverImageId: input.coverImageId,
               tags: {
                  connect: input.tagIds.map((id) => ({
                     tid: id,
                  })),
               },
               JudgeFile: {
                  create: { judgeScript },
               },
            },
            select: {
               pid: true,
            },
         });
         problemId = problem.pid;

         // 创建模板工程
         const fs = Object.entries(input.answerTemplateSnapshot).map(
            ([path, content]) =>
               ({
                  name: path.split('/').pop() || 'unknown',
                  path,
                  content,
               } satisfies IFile)
         );
         await projectService.create({
            fs: fs,
            tx: tx,
            problemId: problem.pid,
            isTemplate: true,
            userId: userId,
         });

         // 创建判题记录
         const templateJudgeRecord = await tx.templateJudgeRecord.create({
            data: {
               problem: {
                  connect: {
                     pid: problem.pid,
                  },
               },
               judgeRecord: {
                  create: {
                     type: 'audit',
                     problemId: problem.pid,
                     userId: userId,
                     info: {},
                  },
               },
            },
            select: {
               judgeRecordId: true,
            },
         });

         // 发送任务到任务处理服务
         await fetch(`${judge.serverUrl}/task/create`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               userId: userId,
               judgeRecordId: templateJudgeRecord.judgeRecordId,
               judgeScript: judgeScript,
               fsSnapshot: input.referenceAnswerSnapshot,
               mode: 'audit',
            }),
         }).then((res: any) => {
            if (!res.ok) {
               throw new Error(`Failed to create task: ${res.message}`);
            }
         });
      });

      return {
         message: 'Problem created and task queued successfully',
         problemId,
      };
   });

const GetPublishDetailsSchema = z.object({
   problemId: z.number('Problem ID must be a number').int(),
});

const getPublishDetailsProcedure = protectedAdminProcedure
   .input(GetPublishDetailsSchema)
   .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const { problemId } = input;

      const result = await prisma.problem.findUniqueOrThrow({
         where: {
            pid: problemId,
         },
         include: {
            tags: true,
            CoverImage: {
               select: {
                  name: true,
                  id: true,
               },
            },
            TemplateJudgeRecord: {
               include: {
                  judgeRecord: true,
               },
            },
            ProblemDefaultCover: {
               include: {
                  image: {
                     select: {
                        id: true,
                        name: true,
                     },
                  },
               },
            },
            JudgeFile: {
               select: {
                  judgeScript: true,
               },
            },
         },
      });

      const templateJudgeRecord = result.TemplateJudgeRecord[0]?.judgeRecord;
      if (!templateJudgeRecord) {
         throw new Error('No template judge record found for this problem');
      }
      if (templateJudgeRecord.userId !== userId) {
         throw new Error('You do not have permission to access this problem');
      }

      const defaultCover = result.ProblemDefaultCover[0]?.image;

      return {
         ...result,
         imageName: result.CoverImage?.name || defaultCover?.name,
      };
   });

const TogglePublishStatusSchema = z.object({
   problemId: z.number('Problem ID must be a number').int(),
   publish: z.boolean('Publish must be a boolean'),
});

const setPublishStatusProcedure = protectedAdminProcedure
   .input(TogglePublishStatusSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const { problemId, publish } = input;

      const problem = await prisma.problem.findUniqueOrThrow({
         where: {
            pid: problemId,
            TemplateJudgeRecord: {
               some: {
                  judgeRecord: { userId },
               },
            },
         },
         select: { status: true },
      });

      if (!['ready', 'published'].includes(problem.status)) {
         throw new Error(
            'Only problems with status "ready" or "published" can change publish status'
         );
      }

      const newStatus = publish ? 'published' : 'ready';

      await prisma.problem.update({
         where: {
            pid: problemId,
         },
         data: {
            status: newStatus,
         },
      });

      return { message: `Problem is now ${newStatus}` };
   });

export const publishRouter = router({
   getDetails: getPublishDetailsProcedure,
});

export const problemRouter = router({
   upload: uploadProcedure,
   getPublishDetails: getPublishDetailsProcedure,
   setPublishStatus: setPublishStatusProcedure,
});
