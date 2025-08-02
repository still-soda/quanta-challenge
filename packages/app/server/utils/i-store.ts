export interface IStore {
   /** 保存文件 */
   save(file: File): Promise<string>;
   /** 获取文件 */
   get(fileId: string): Promise<File | null>;
   /** 删除文件 */
   delete(fileId: string): Promise<void>;
   /** 列出所有文件 */
   list(): Promise<string[]>;
   /** 获取文件的访问URL */
   url(fileId: string): Promise<string>;
   /** 检查文件是否存在 */
   exists(fileId: string): Promise<boolean>;
   /** 清理过期文件 */
   cleanup(): Promise<void>;
}
