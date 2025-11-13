import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { CommandData } from '../_subpages/editor/_components/RightClickMenuProvider.vue';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';

class FileSystemOperator {
   constructor(
      private getWebContainerInstance: () => Promise<WebContainer>,
      private fsTree: Ref<IFileSystemItem[] | undefined>
   ) {}

   private _traverseFindParent(path: string): IFileSystemItem | null {
      const pathParts = path.split('/');
      const node = this.fsTree.value;
      if (!node) return null;

      let currentItems = node;
      let parent: IFileSystemItem | null = null;

      for (let i = 0; i < pathParts.length - 1; i++) {
         const part = pathParts[i];
         const nextItem = currentItems.find((item) => item.name === part);
         if (!nextItem || nextItem.type !== 'folder' || nextItem.suspense) {
            return null;
         }
         parent = nextItem;
         currentItems = nextItem.children || [];
      }

      return parent;
   }

   async removeItem(path: string, type: 'file' | 'folder') {
      const wc = await this.getWebContainerInstance();

      if (type === 'file' && confirm('你确定要删除该文件吗？')) {
         await wc.fs.rm(path);
      } else if (confirm('你确定要删除该文件夹吗？')) {
         await wc.fs.rm(path, { recursive: true });
      }

      const parent = this._traverseFindParent(path);
      if (parent && parent.children) {
         parent.children = parent.children.filter((item) => item.path !== path);
      }
   }

   async renameItem(oldPath: string, newName: string) {
      const wc = await this.getWebContainerInstance();

      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');

      await wc.fs.rename(oldPath, newPath);

      const parent = this._traverseFindParent(oldPath);
      if (parent && parent.children) {
         parent.children = parent.children.map((item) => {
            if (item.path === oldPath) {
               return { ...item, name: newName, path: newPath };
            }
            return item;
         });
      }
   }

   async moveItem(oldPath: string, newPath: string) {
      const wc = await this.getWebContainerInstance();

      // 检查目标路径是否已存在
      try {
         await wc.fs.readFile(newPath);
         alert('目标路径已存在！');
         return;
      } catch {
         try {
            await wc.fs.readdir(newPath);
            alert('目标路径已存在！');
            return;
         } catch {
            // 不存在，继续
         }
      }

      await wc.fs.rename(oldPath, newPath);

      // 从旧父节点中移除
      const oldParent = this._traverseFindParent(oldPath);
      let itemToMove: IFileSystemItem | undefined;

      if (oldParent && oldParent.children) {
         itemToMove = oldParent.children.find((item) => item.path === oldPath);
         if (itemToMove) {
            oldParent.children = oldParent.children.filter(
               (item) => item.path !== oldPath
            );
         }
      } else if (this.fsTree.value) {
         // 根级别的节点
         itemToMove = this.fsTree.value.find((item) => item.path === oldPath);
         if (itemToMove) {
            this.fsTree.value = this.fsTree.value.filter(
               (item) => item.path !== oldPath
            );
         }
      }

      if (!itemToMove) return;

      // 添加到新父节点
      const newParent = this._traverseFindParent(newPath);
      const newName = newPath.split('/').pop()!;

      // 递归更新所有子节点的路径
      const updatePaths = (
         item: IFileSystemItem,
         oldBasePath: string,
         newBasePath: string
      ) => {
         item.path = item.path.replace(oldBasePath, newBasePath);
         if (item.children) {
            item.children.forEach((child) =>
               updatePaths(child, oldBasePath, newBasePath)
            );
         }
      };

      const movedItem = { ...itemToMove, name: newName, path: newPath };
      updatePaths(movedItem, oldPath, newPath);

      if (newParent && newParent.children) {
         newParent.children.push(movedItem);
      } else if (this.fsTree.value) {
         // 根级别的节点
         this.fsTree.value.push(movedItem);
      }
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
         children: [],
         suspense: true,
      });
   }
}

type ChangeTreeItem = { path: string; children?: ChangeTreeItem[] };

class FileSystemDispatcher {
   constructor(
      private getWebContainerInstance: () => Promise<WebContainer>,
      private fsTree: Ref<IFileSystemItem[] | undefined>,
      private changePaths: Set<string> = new Set()
   ) {}

   async startListening() {
      const wc = await this.getWebContainerInstance();
      wc.fs.watch('/', { recursive: true }, (event, path) => {
         this._handleFsEvent(event, this._decodePath(path));
      });
   }

   stopListening() {
      if (this._dispatchTimer) {
         clearTimeout(this._dispatchTimer);
         this._dispatchTimer = null;
      }
      // 处理剩余的变更
      if (this.changePaths.size > 0) {
         this._dispatchChanges();
      }
   }

   private _decodePath(data: Uint8Array | string): string {
      if (typeof data === 'string') {
         return data;
      }
      return new TextDecoder().decode(data);
   }

   private async _handleFsEvent(event: string, path: string) {
      if (event === 'rename') {
         this.changePaths.add(path);
         // 防抖处理：延迟一段时间后批量处理变更
         this._scheduleDispatch();
      }
   }

   private _dispatchTimer: ReturnType<typeof setTimeout> | null = null;

   private _scheduleDispatch() {
      if (this._dispatchTimer) {
         clearTimeout(this._dispatchTimer);
      }

      this._dispatchTimer = setTimeout(() => {
         this._dispatchChanges();
      }, 300); // 300ms 防抖
   }

   private async _dispatchChanges() {
      if (this.changePaths.size === 0) return;

      const pathToDispatch = Array.from(this.changePaths);
      this.changePaths.clear();

      try {
         // 构建变更树
         const changeTree = this._buildChangeTree(pathToDispatch);

         // 遍历并更新 fsTree
         await this._traverseAndUpdate(changeTree);
      } catch (error) {
         console.error(
            '[FileSystemDispatcher] Error dispatching changes:',
            error
         );
      }
   }

   private _buildChangeTree(paths: string[]): ChangeTreeItem[] {
      const root: ChangeTreeItem[] = [];

      for (const path of paths) {
         const parts = path.split('/').filter(Boolean);
         let currentLevel = root;
         let currentPath = '';

         for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath += (currentPath ? '/' : '') + part;

            let existingNode = currentLevel.find(
               (node) => node.path === currentPath
            );

            if (!existingNode) {
               existingNode = {
                  path: currentPath,
                  children: i < parts.length - 1 ? [] : undefined,
               };
               currentLevel.push(existingNode);
            }

            if (i < parts.length - 1) {
               if (!existingNode.children) {
                  existingNode.children = [];
               }
               currentLevel = existingNode.children;
            }
         }
      }

      return root;
   }

   private async _traverseAndUpdate(tree: ChangeTreeItem[]) {
      const wc = await this.getWebContainerInstance();

      for (const node of tree) {
         // 在 fsTree 中查找对应的节点
         const fsNode = this._findNodeInFsTree(node.path);

         // 检查 wc 中是否存在该路径
         let existsInWc = false;
         try {
            await wc.fs.readdir(node.path);
            existsInWc = true;
         } catch {
            try {
               await wc.fs.readFile(node.path);
               existsInWc = true;
            } catch {
               existsInWc = false;
            }
         }

         if (existsInWc && !fsNode) {
            // wc 中存在但 fs 中不存在，需要新增
            await this._addNodeToFsTree(node.path, node.children !== undefined);
         } else if (!existsInWc && fsNode) {
            // wc 中不存在但 fs 中存在，需要删除
            this._removeNodeFromFsTree(node.path);
         } else if (
            existsInWc &&
            fsNode &&
            fsNode.suspense &&
            fsNode.type === 'folder'
         ) {
            // 悬空文件夹，终止该分支的遍历
            continue;
         }

         // 递归处理子节点
         if (node.children && node.children.length > 0) {
            await this._traverseAndUpdate(node.children);
         }
      }
   }

   private _findNodeInFsTree(path: string): IFileSystemItem | null {
      const pathParts = path.split('/').filter(Boolean);
      const node = this.fsTree.value;
      if (!node) return null;

      let currentItems = node;

      for (let i = 0; i < pathParts.length; i++) {
         const part = pathParts[i];
         const nextItem = currentItems.find((item) => item.name === part);
         if (!nextItem) return null;

         if (i === pathParts.length - 1) {
            return nextItem;
         }

         if (nextItem.type !== 'folder' || !nextItem.children) {
            return null;
         }

         currentItems = nextItem.children;
      }

      return null;
   }

   private async _addNodeToFsTree(path: string, isFolder: boolean) {
      const wc = await this.getWebContainerInstance();
      const pathParts = path.split('/').filter(Boolean);
      const name = pathParts[pathParts.length - 1];

      if (!name) return;

      const parent = this._traverseFindParentInDispatcher(path);
      const newNode: IFileSystemItem = {
         name,
         path,
         type: isFolder ? 'folder' : 'file',
         suspense: true, // 统一标记为 suspense，让组件去加载内容
         ...(isFolder ? { children: [] } : {}),
      };

      if (parent && parent.children) {
         // 检查是否已存在，避免重复添加
         const existingIndex = parent.children.findIndex(
            (item) => item.path === path
         );
         if (existingIndex >= 0) {
            // 已存在则更新
            parent.children[existingIndex] = newNode;
         } else {
            parent.children.push(newNode);
         }
      } else if (pathParts.length === 1 && this.fsTree.value) {
         // 根级别的节点
         const existingIndex = this.fsTree.value.findIndex(
            (item) => item.path === path
         );
         if (existingIndex >= 0) {
            this.fsTree.value[existingIndex] = newNode;
         } else {
            this.fsTree.value.push(newNode);
         }
      }
   }

   private _removeNodeFromFsTree(path: string) {
      const parent = this._traverseFindParentInDispatcher(path);
      if (parent && parent.children) {
         parent.children = parent.children.filter((item) => item.path !== path);
      } else if (this.fsTree.value) {
         // 根级别的节点
         const pathParts = path.split('/').filter(Boolean);
         if (pathParts.length === 1) {
            this.fsTree.value = this.fsTree.value.filter(
               (item) => item.path !== path
            );
         }
      }
   }

   private _traverseFindParentInDispatcher(
      path: string
   ): IFileSystemItem | null {
      const pathParts = path.split('/').filter(Boolean);
      const node = this.fsTree.value;
      if (!node) return null;

      let currentItems = node;
      let parent: IFileSystemItem | null = null;

      for (let i = 0; i < pathParts.length - 1; i++) {
         const part = pathParts[i];
         const nextItem = currentItems.find((item) => item.name === part);
         if (!nextItem || nextItem.type !== 'folder') {
            return null;
         }
         parent = nextItem;
         currentItems = nextItem.children || [];
      }

      return parent;
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

   const dispatcher = new FileSystemDispatcher(
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
      dispatcher.startListening();
   });

   onUnmounted(() => {
      commandEmitter.off(listener);
      dispatcher.stopListening();
   });

   return {
      commandEmitter,
      operator,
      dispatcher,
   };
};
