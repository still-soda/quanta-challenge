import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { CommandData } from '../_subpages/editor/_components/RightClickMenuProvider.vue';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';

class FileSystemOperator {
   constructor(
      private getWebContainerInstance: () => Promise<WebContainer>,
      private fsTree: Ref<IFileSystemItem[] | undefined>
   ) {}

   async removeItem(path: string, type: 'file' | 'folder') {
      const wc = await this.getWebContainerInstance();

      if (type === 'file' && confirm('你确定要删除该文件吗？')) {
         await wc.fs.rm(path);
         this.fsTree.value = this.fsTree.value?.filter(
            (item) => item.path !== path
         );
      } else if (confirm('你确定要删除该文件夹吗？')) {
         await wc.fs.rm(path, { recursive: true });
         this.fsTree.value = this.fsTree.value?.filter(
            (item) => !item.path.startsWith(path)
         );
      }
   }

   async renameItem(oldPath: string, newName: string) {
      const wc = await this.getWebContainerInstance();

      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');

      await wc.fs.rename(oldPath, newPath);

      this.fsTree.value = this.fsTree.value?.map((item) => {
         if (item.path === oldPath) {
            return { ...item, path: newPath, name: newName };
         }
         return item;
      });
   }

   async moveItem(oldPath: string, newPath: string) {
      const wc = await this.getWebContainerInstance();
      await wc.fs.rename(oldPath, newPath);
      this.fsTree.value = this.fsTree.value?.map((item) => {
         if (item.path === oldPath) {
            return { ...item, path: newPath };
         }
         return item;
      });
   }

   async createFile(path: string) {
      const wc = await this.getWebContainerInstance();
      await wc.fs.writeFile(path, '');
      this.fsTree.value?.push({
         name: path.split('/').pop()!,
         path,
         type: 'file',
      });
   }

   async createDirectory(path: string) {
      const wc = await this.getWebContainerInstance();
      await wc.fs.mkdir(path);
      this.fsTree.value?.push({
         name: path.split('/').pop()!,
         path,
         type: 'folder',
         suspense: true,
      });
   }
}

interface IUseCommandOptions {
   runCommand: (commandLine: string | string[]) => Promise<WebContainerProcess>;
   getWebContainerInstance: () => Promise<WebContainer>;
   fsTree: Ref<IFileSystemItem[] | undefined>;
}

export const useCommands = (props: IUseCommandOptions) => {
   const operator = new FileSystemOperator(
      props.getWebContainerInstance,
      props.fsTree
   );

   const commandEmitter = useEventBus<CommandData>('right-click-menu-command');

   const listener = async (commandData: CommandData) => {
      switch (commandData.type) {
         case 'remove': {
            await operator.removeItem(
               commandData.target.path,
               commandData.target.type
            );
            break;
         }
         case 'rename': {
            const newName = prompt('Enter new name') || commandData.target.path;
            if (!newName) return;
            await operator.renameItem(commandData.target.path, newName);
            break;
         }
         case 'move': {
            const newPath = prompt('Enter new path') || commandData.target.path;
            if (!newPath) return;
            await operator.moveItem(commandData.target.path, newPath);
            break;
         }
         case 'add-file': {
            const fileName = prompt('Enter file name') || 'new-file.txt';
            if (!fileName) return;
            await operator.createFile(commandData.target.path + '/' + fileName);
            break;
         }
         case 'add-directory': {
            const dirName = prompt('Enter directory name') || 'new-directory';
            if (!dirName) return;
            await operator.createDirectory(
               commandData.target.path + '/' + dirName
            );
            break;
         }
      }
   };

   onMounted(() => {
      commandEmitter.on(listener);
   });

   onUnmounted(() => {
      commandEmitter.off(listener);
   });
};
