import z from 'zod';
import { protectedProcedure } from '../../protected-trpc';
import prisma from '@challenge/database';
import { projectService } from '../../services/project';
import { router } from '../../trpc';

const GetOrForkProjectSchema = z.object({
   problemId: z.number('Project ID must be a number'),
});

const getOrForkProject = protectedProcedure
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

export const problemRouter = router({
   getOrForkProject: getOrForkProject,
});
