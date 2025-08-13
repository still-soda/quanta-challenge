import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';

/**
 * 建立文件系统树。使用路径内容映射构建文件系统树
 * @param fs 路径内容映射
 * @returns 文件系统树
 */
export const buildFileSystemTree = (fs: Record<string, string>) => {
   const filePathsMap = new Map<string, IFileSystemItem>();
   const rootItems: IFileSystemItem[] = [];

   // 首先创建所有文件节点
   Object.entries(fs).forEach(([path, content]) => {
      const segments = path.split('/').filter(Boolean); // 移除空字符串
      const fileName = segments[segments.length - 1] ?? '';

      const fileItem: IFileSystemItem = {
         name: fileName,
         path: segments.join('/'),
         type: 'file',
         content,
      };

      filePathsMap.set(segments.join('/'), fileItem);
   });

   // 然后创建所有必要的文件夹节点
   const allPaths = Array.from(filePathsMap.keys());
   const folderPaths = new Set<string>();

   allPaths.forEach((filePath) => {
      const segments = filePath.split('/');
      // 为每个文件路径创建所有父级文件夹
      for (let i = 1; i < segments.length; i++) {
         const folderPath = segments.slice(0, i).join('/');
         if (!folderPaths.has(folderPath) && !filePathsMap.has(folderPath)) {
            folderPaths.add(folderPath);
            const folderName = segments[i - 1] ?? '';
            const folderItem: IFileSystemItem = {
               name: folderName,
               path: folderPath,
               type: 'folder',
               children: [],
            };
            filePathsMap.set(folderPath, folderItem);
         }
      }
   });

   // 构建树形结构
   const sortedPaths = Array.from(filePathsMap.keys()).sort();

   sortedPaths.forEach((path) => {
      const item = filePathsMap.get(path)!;
      const segments = path.split('/');
      if (segments.length === 1) {
         rootItems.push(item);
      } else {
         const parentPath = segments.slice(0, -1).join('/');
         const parent = filePathsMap.get(parentPath);
         if (parent && parent.type === 'folder') {
            parent.children = parent.children || [];
            parent.children.push(item);
         }
      }
   });

   return rootItems;
};

/**
 * 使用文件系统树构建路径内容映射
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
            map[item.path] = item.content!;
         } else if (item.type === 'folder' && item.children) {
            traverse(item.children);
         }
      }
   };

   traverse(tree);
   return map;
};
