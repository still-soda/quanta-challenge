export interface FileSystemItem {
   name: string;
   path: string;
   type: 'file' | 'folder';
   mimeType?: string;
   content?: string;
   children?: FileSystemItem[];
}
