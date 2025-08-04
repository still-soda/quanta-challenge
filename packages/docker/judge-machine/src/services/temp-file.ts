import path from 'path';
import { Singleton } from '../utils/singleton.js';
import fs from 'fs/promises';

export class TempFileService extends Singleton {
   static get instance() {
      return this.getInstance<TempFileService>();
   }

   private constructor(
      private readonly fileRoot: string = '/tmp/judge-machine'
   ) {
      super();
      const rootPath = this.resolvePath();
      fs.mkdir(rootPath, { recursive: true }).catch((error) => {
         throw new Error(
            `Failed to create temp file root directory: ${error.message}`
         );
      });
   }

   resolvePath(...paths: string[]) {
      const __dirname = path.dirname(import.meta.url);
      return path.join(__dirname, this.fileRoot, ...paths);
   }

   async writeTempFile(content: string | Buffer, ext: string = '.js') {
      const fileId = crypto.randomUUID();
      const filePath = this.resolvePath(`${fileId}${ext}`);

      await fs.writeFile(filePath, content);

      return { filePath, fileId };
   }

   async clearTempFile(filePath: string) {
      const dirPath = this.resolvePath();
      if (!filePath.startsWith(dirPath)) {
         throw new Error('Invalid file path');
      }

      try {
         await fs.rm(filePath, { force: true });
      } catch (error) {
         console.error(`Failed to delete temp file: ${filePath}`, error);
      }
   }

   async cleanup() {
      const dirPath = this.resolvePath();
      const files = (await fs.readdir(dirPath, { withFileTypes: true })).filter(
         (file) => file.isFile()
      );
      await Promise.all(
         files.map((file) =>
            fs.rm(path.join(dirPath, file.name), { force: true })
         )
      );
   }
}
