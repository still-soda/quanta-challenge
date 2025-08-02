export type File = string;
export interface IDirectory {
   [key: string]: File | IDirectory;
}

interface IWalkFileListOptions {
   exclude?: {
      directories?: string[];
      files?: string[];
   };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
   let binary = '';
   const bytes = new Uint8Array(buffer);
   const len = bytes.byteLength;
   for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]!);
   }
   return btoa(binary);
}

export const walkFileList = async (
   fileList: FileList,
   options?: IWalkFileListOptions
) => {
   const currentDirectory: IDirectory = {};
   const excludeDirectories = options?.exclude?.directories || [];
   const excludeFiles = options?.exclude?.files || [];

   for (const file of Array.from(fileList)) {
      const pathParts = file.webkitRelativePath.split('/');
      let currentDir = currentDirectory;

      const dirs = pathParts.slice(0, -1);
      if (excludeDirectories.some((dir) => dirs.includes(dir))) {
         continue; // Skip excluded directories
      }
      if (excludeFiles.includes(file.name)) {
         continue; // Skip excluded files
      }

      for (let i = 0; i < pathParts.length - 1; i++) {
         const part = pathParts[i]!;
         if (!currentDir[part]) {
            currentDir[part] = {};
         }
         currentDir = currentDir[part] as IDirectory;
      }

      currentDir[pathParts[pathParts.length - 1]!] = await (async () => {
         const mimeType = file.type;
         if (mimeType && mimeType.startsWith('image/')) {
            const buffer = await file.arrayBuffer();
            const b64 = arrayBufferToBase64(buffer);
            return `data:${mimeType};base64,${b64}`;
         } else {
            return file.text();
         }
      })();
   }
   return currentDirectory;
};
