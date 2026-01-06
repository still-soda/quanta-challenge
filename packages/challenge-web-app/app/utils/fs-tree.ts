import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';
import {
   normalizePath,
   splitPath,
   joinPath,
   getParentPath,
   getBaseName,
} from './path-utils';

/**
 * 建立文件系统树。使用路径内容映射构建文件系统树
 * 所有路径统一使用前置 / 格式
 * @param fs 路径内容映射（可以是任意格式，会自动规范化）
 * @returns 文件系统树
 */
export const buildFileSystemTree = (fs: Record<string, string>) => {
   const filePathsMap = new Map<string, IFileSystemItem>();
   const rootItems: IFileSystemItem[] = [];
   const fileNodes: IFileSystemItem[] = [];
   const folderNodes: IFileSystemItem[] = [];

   // 首先创建所有文件节点
   Object.entries(fs).forEach(([path, content]) => {
      const normalizedPath = normalizePath(path);
      const fileName = getBaseName(normalizedPath);

      const fileItem: IFileSystemItem = {
         name: fileName,
         path: normalizedPath,
         type: 'file',
         content,
      };
      fileNodes.push(fileItem);

      filePathsMap.set(normalizedPath, fileItem);
   });

   // 然后创建所有必要的文件夹节点
   const allPaths = Array.from(filePathsMap.keys());
   const folderPaths = new Set<string>();

   allPaths.forEach((filePath) => {
      const segments = splitPath(filePath);
      // 为每个文件路径创建所有父级文件夹
      for (let i = 1; i < segments.length; i++) {
         const folderPath = joinPath(...segments.slice(0, i));
         if (!folderPaths.has(folderPath) && !filePathsMap.has(folderPath)) {
            folderPaths.add(folderPath);
            const folderName = segments[i - 1] ?? '';
            const folderItem: IFileSystemItem = {
               name: folderName,
               path: folderPath,
               type: 'folder',
               children: [],
            };
            folderNodes.push(folderItem);
            filePathsMap.set(folderPath, folderItem);
         }
      }
   });

   // 构建树形结构
   const sortedPaths = Array.from(filePathsMap.keys()).sort();

   sortedPaths.forEach((path) => {
      const item = filePathsMap.get(path)!;
      const segments = splitPath(path);
      if (segments.length === 1) {
         // 顶级项目
         rootItems.push(item);
      } else {
         // 需要找到父级并添加
         const parentPath = getParentPath(path);
         const parent = filePathsMap.get(parentPath);
         if (parent && parent.type === 'folder') {
            parent.children = parent.children || [];
            parent.children.push(item);
         }
      }
   });

   return {
      rootNodes: rootItems,
      fileNodes,
      folderNodes,
   };
};

/**
 * 使用文件系统树构建路径内容映射
 * 返回的所有路径都是规范化的（前置 / 格式）
 * @param tree 文件系统树
 * @returns 路径内容映射
 */
export const buildPathContentMapFromFsTree = (
   tree: IFileSystemItem[]
): Record<string, string> => {
   const map: Record<string, string> = {};

   const traverse = (items: IFileSystemItem[]) => {
      for (const item of items) {
         if (item.type === 'file') {
            // 确保路径是规范化的
            const normalizedPath = normalizePath(item.path);
            map[normalizedPath] = item.content!;
         } else if (item.type === 'folder' && item.children) {
            traverse(item.children);
         }
      }
   };

   traverse(tree);
   return map;
};
