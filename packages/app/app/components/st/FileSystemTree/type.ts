export interface IFileSystemItem {
   name: string;
   path: string;
   type: 'file' | 'folder';
   mimeType?: string;
   content?: string;
   children?: IFileSystemItem[];
   suspense?: boolean;
}
