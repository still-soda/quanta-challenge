import path from 'path';
import { Singleton } from '../utils/singleton.js';
import fs from 'fs/promises';

export class TempFileService extends Singleton {
   static get instance() {
      return this.getInstance<TempFileService>();
   }

   private constructor(
      public readonly tempDir: string = process.env.TEMP_DIR || '/tmp'
   ) {
      super();
   }

   resolvePath(fileName: string): string {
      const cwd = process.cwd();
      return path.join(cwd, this.tempDir, fileName);
   }

   async restoreFileSystem(fsSnapshot: Record<string, string>) {
      const fsName = crypto.randomUUID();
      const fsRootPath = this.resolvePath(fsName);

      for (const [filePath, content] of Object.entries(fsSnapshot)) {
         const fullPath = path.join(fsRootPath, filePath);
         const dir = path.dirname(fullPath);
         await fs.mkdir(dir, { recursive: true });
         await fs.writeFile(fullPath, content);
      }

      return { fsName, fsRootPath };
   }

   async cleanup(fsRootPath: string) {
      if (!fsRootPath.startsWith(this.resolvePath('.'))) {
         throw new Error(
            `Cannot clean up files outside of the temporary directory: ${fsRootPath}`
         );
      }
      try {
         await fs.rm(fsRootPath, { recursive: true, force: true });
      } catch (error) {
         console.error(
            `Error cleaning up temporary file system at ${fsRootPath}:`,
            error
         );
      }
   }
}
