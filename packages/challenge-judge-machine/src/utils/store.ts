export interface IStoreService {
   /** 保存文件 */
   save(buffer: Buffer, name: string): Promise<string>;
   /** 获取文件 */
   get(fileId: string): Promise<File | null>;
   /** 获取文件的访问URL */
   url(fileId: string): Promise<string>;
}
