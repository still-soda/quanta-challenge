import prisma from '@challenge/database';
import { Prisma, PrismaClient, VirtualFile } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

type Tx = Omit<
   PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
   '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface IFile {
   name: string;
   path: string;
   content: string;
}

export interface ICreateProjectOptions {
   fs: IFile[];
   isTemplate: boolean;
   userId: string;
   problemId: number;
   projectName?: string;
   tx?: Tx;
}

/**
 * 使用指定的选项创建一个新项目。
 * @param options 创建项目所需的选项
 * @returns 返回创建的项目ID、文件系统ID和虚拟文件ID列表
 */
const create = async (options: ICreateProjectOptions) => {
   const result = {
      projectId: '',
      fileSystemId: '',
      virtualFileIds: [] as string[],
   };

   const doTransaction = async (tx: Tx) => {
      // Create the project
      const project = await tx.project.create({
         data: {
            isTemplate: options.isTemplate,
            name: options.projectName || `Project-${Date.now()}`,
            owner: {
               connect: {
                  id: options.userId,
               },
            },
            problem: {
               connect: {
                  pid: options.problemId,
               },
            },
         },
         select: {
            pid: true,
         },
      });
      result.projectId = project.pid;

      // Create the file system for the project
      const fileSystem = await tx.fileSystem.create({
         data: {
            ownerId: options.userId,
            projectId: project.pid,
         },
         select: {
            fsid: true,
         },
      });
      result.fileSystemId = fileSystem.fsid;

      // Create the virtual files in the file system
      await tx.virtualFile.createMany({
         data: options.fs.map(
            (file) =>
               ({
                  path: file.path,
                  content: file.content,
                  ownerId: options.userId,
                  fileSystemFsid: fileSystem.fsid,
               } satisfies Omit<VirtualFile, 'vid' | 'createdAt' | 'updatedAt'>)
         ),
      });

      const vids = await tx.virtualFile.findMany({
         where: {
            fileSystemFsid: result.fileSystemId,
         },
         select: {
            vid: true,
         },
      });
      result.virtualFileIds = vids.map((v) => v.vid);
   };

   if (options.tx) {
      await doTransaction(options.tx);
   } else {
      await prisma.$transaction(doTransaction);
   }

   return result;
};

export interface IForkProjectOptions {
   projectId: string;
   userId: string;
   problemId?: number;
   projectName?: string;
   isTemplate?: boolean;
   tx?: Tx;
}

/**
 * 使用指定的选项克隆一个项目。
 * @param options 克隆项目所需的选项
 * @returns 返回克隆的项目ID、文件系统ID和虚拟文件ID列表
 */
const fork = async (options: IForkProjectOptions) => {
   const result = {
      projectId: '',
      fileSystemId: '',
      virtualFileIds: [] as string[],
   };

   const doTransaction = async (tx: Tx) => {
      // 创建新项目，返回项目ID
      const newProjectResult = await tx.$queryRaw<{ pid: string }[]>`
         INSERT INTO "Project" (isTemplate, name, ownerId, problemId)
         SELECT 
            COALESCE(${options.isTemplate}, isTemplate), 
            COALESCE(${options.projectName}, 'Project-' || EXTRACT(EPOCH FROM NOW())), 
            ${options.userId}, 
            COALESCE(${options.problemId}, problemId)
         FROM "Project"
         WHERE pid = ${options.projectId}
         RETURNING pid
      `;

      if (!newProjectResult || newProjectResult.length === 0) {
         throw new Error(
            'Failed to create new project or original project not found'
         );
      }

      const newProjectId = newProjectResult[0].pid;
      result.projectId = newProjectId;

      // 创建新文件系统
      const newFileSystem = await tx.fileSystem.create({
         data: {
            ownerId: options.userId,
            projectId: newProjectId,
         },
         select: {
            fsid: true,
         },
      });
      const newFileSystemId = newFileSystem.fsid;
      result.fileSystemId = newFileSystemId;

      // 克隆虚拟文件到新文件系统
      await tx.$executeRaw`
         INSERT INTO "VirtualFile" (path, content, ownerId, fileSystemFsid)
         SELECT 
            path, 
            content, 
            ${options.userId}, 
            ${newFileSystemId}
         FROM "VirtualFile"
         WHERE fileSystemFsid = (
            SELECT fsid
            FROM "FileSystem"
            WHERE projectId = ${options.projectId}
         )
      `;
      const vids = await tx.virtualFile.findMany({
         where: {
            fileSystemFsid: result.fileSystemId,
         },
         select: {
            vid: true,
         },
      });
      result.virtualFileIds = vids.map((v) => v.vid);
   };

   if (options.tx) {
      await doTransaction(options.tx);
   } else {
      await prisma.$transaction(doTransaction);
   }

   return result;
};

export const projectService = {
   create,
   fork,
};
