import prisma from '@challenge/database';
import { protectedAdminProcedure } from '../../protected-trpc';
import { PublishSchema } from '../../schemas/publish-schema';
import { router } from '../../trpc';
import { IFile, projectService } from '../../services/project';

const uploadProcedure = protectedAdminProcedure
   .input(PublishSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

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
                  create: {
                     judgeScript: input.judgeScript,
                  },
               },
            },
            select: {
               pid: true,
            },
         });

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
         const judgeRecord = await tx.judgeRecord.create({
            data: {
               type: 'audit',
               problemId: problem.pid,
               userId: userId,
            },
            select: {
               id: true,
            },
         });

         // 发送任务到任务处理服务
         await fetch('http://localhost:1888/task/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               userId: userId,
               judgeRecordId: judgeRecord.id,
               judgeScript: input.judgeScript,
               fsSnapshot: input.answerTemplateSnapshot,
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
      };
   });

export const problemRouter = router({
   upload: uploadProcedure,
});
