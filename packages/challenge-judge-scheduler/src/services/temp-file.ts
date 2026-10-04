import path from 'path';
import os from 'os';
import { Singleton } from '../utils/singleton';
import fs from 'fs/promises';

export class TempFileService extends Singleton {
   static get instance() {
      return this.getInstance<TempFileService>();
   }

   private constructor(
      // 默认用 os.tmpdir() 而不是硬编码 '/tmp'。
      //
      // '/tmp' 在 Windows 上会被 path.isAbsolute() 判定为「绝对路径」（因为它以 '/' 开头），
      // 但它并不是合法的 Windows 路径；把它交给 Docker daemon 做 bind mount 会直接报
      //   server error - \tmp\<uuid> is not a valid Windows path
      // os.tmpdir() 在 Linux 上是 /tmp，在 Windows 上是 %TEMP%，两边都是本机合法路径。
      public readonly tempDir: string = process.env.TEMP_DIR || os.tmpdir()
   ) {
      super();
   }

   resolvePath(fileName: string): string {
      // 必须区分绝对路径与相对路径：
      // TEMP_DIR 配成绝对路径（容器部署的必需做法，例如 /app/tmp）时必须原样使用。
      // 原实现无条件 path.join(process.cwd(), this.tempDir, fileName) 会把绝对路径当成
      // 普通目录名拼在 cwd 后面，得到
      //   /app/packages/challenge-judge-scheduler/app/tmp/<uuid>
      // —— 既不是配置值，宿主机上也必然不存在，判题机启动容器时直接失败：
      //   invalid mount config for type "bind": bind source path does not exist
      // 相对路径仍按 cwd 解析，保持原有行为。
      if (path.isAbsolute(this.tempDir)) {
         return path.join(this.tempDir, fileName);
      }
      return path.join(process.cwd(), this.tempDir, fileName);
   }

   async restoreFileSystem(fsSnapshot: Record<string, string>) {
      const fsName = crypto.randomUUID();
      const fsRootPath = this.resolvePath(fsName);

      for (const [filePath, content] of Object.entries(fsSnapshot)) {
         const fullPath = path.join(fsRootPath, filePath);
         const dir = path.dirname(fullPath);
         await fs.mkdir(dir, { recursive: true });
         if (content.startsWith('data:image')) {
            const base64Content = content.split(',')[1];
            const buffer = Buffer.from(base64Content, 'base64');
            await fs.writeFile(fullPath, buffer);
         } else {
            await fs.writeFile(fullPath, content);
         }
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
