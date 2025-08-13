import type {
   DirectoryNode,
   FileNode,
   FileSystemTree,
} from '@WebContainer/api';

const isFileNode = (node: any): node is FileNode => {
   return typeof node === 'object' && 'file' in node;
};

const isDirectoryNode = (node: any): node is DirectoryNode => {
   return typeof node === 'object' && 'directory' in node;
};

const uint8ArrayToBase64 = (bytes: Uint8Array) => {
   let binary = '';
   const len = bytes.byteLength;
   for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]!);
   }
   return btoa(binary);
};

export const convertToPathContentMap = (fsTree: FileSystemTree) => {
   const pathContentMap: Record<string, string> = {};

   const traverse = (fsTree: FileSystemTree, currentPath: string) => {
      Object.entries(fsTree).forEach(([name, node]) => {
         if (isFileNode(node)) {
            pathContentMap[currentPath + name] =
               node.file.contents instanceof Uint8Array
                  ? uint8ArrayToBase64(node.file.contents)
                  : node.file.contents;
         } else if (isDirectoryNode(node)) {
            traverse(node.directory, currentPath + name + '/');
         }
      });
   };
   traverse(fsTree, '');

   return pathContentMap;
};
