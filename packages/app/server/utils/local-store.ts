import path from 'path';
import { IStore } from './i-store';
import fs from 'fs/promises';

export class LocalStore implements IStore {
   private storePath: string = process.env.LOCAL_STORE_PATH || './local_store';

   constructor() {
      fs.mkdir(this.storePath, { recursive: true });
   }

   async save(file: File) {
      const fileId = crypto.randomUUID();
      const extension = path.extname(file.name);
      const filePath = path.join(this.storePath, `${fileId}${extension}`);
      const buffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(buffer));
      return fileId;
   }

   async get(fileId: string): Promise<File | null> {
      const files = await fs.readdir(this.storePath);
      const file = files.find((f) => f.startsWith(fileId));
      if (!file) return null;
      const buffer = await fs.readFile(path.join(this.storePath, file));
      return new File([buffer], file);
   }

   async exists(fileId: string): Promise<boolean> {
      const files = await fs.readdir(this.storePath);
      return files.some((f) => f.startsWith(fileId));
   }

   async delete(fileId: string): Promise<void> {
      return fs.readdir(this.storePath).then((files) => {
         const file = files.find((f) => f.startsWith(fileId));
         if (file) {
            return fs.unlink(path.join(this.storePath, file));
         }
         return Promise.resolve();
      });
   }

   async list(): Promise<string[]> {
      const files = await fs.readdir(this.storePath);
      return files;
   }

   async url(fileId: string): Promise<string> {
      const file = await this.get(fileId);
      if (!file) throw new Error('File not found');
      return `static/${file.name}`;
   }

   cleanup(): Promise<void> {
      throw new Error('Method not implemented.');
   }
}
