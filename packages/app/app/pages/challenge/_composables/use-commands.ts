import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { CommandData } from '../_subpages/editor/_components/RightClickMenuProvider.vue';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';
import { dialog } from '~/composables/use-dialog';
import { useMessage } from '~/components/st/Message/use-message';

type MessageAPI = ReturnType<typeof useMessage>;

class FileSystemOperator {
   constructor(
      private getWebContainerInstance: () => Promise<WebContainer>,
      private fsTree: Ref<IFileSystemItem[] | undefined>,
      private message: MessageAPI
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

      const confirmed = await dialog.confirm({
         title: type === 'file' ? '删除文件' : '删除文件夹',
         description:
            type === 'file'
               ? '确定要删除该文件吗？此操作无法撤销。'
               : '确定要删除该文件夹及其所有内容吗？此操作无法撤销。',
         variant: 'danger',
         confirmText: '删除',
         cancelText: '取消',
      });

      if (!confirmed) return;

      try {
         if (type === 'file') {
            await wc.fs.rm(path);
         } else {
            await wc.fs.rm(path, { recursive: true });
         }

         const parent = this._traverseFindParent(path);
         if (parent && parent.children) {
            parent.children = parent.children.filter(
               (item) => item.path !== path
            );
         }

         // 发送文件删除事件
         const fileDeleteEmitter = useEventBus<{
            path: string;
            type: 'file' | 'folder';
         }>('file-delete-event');
         fileDeleteEmitter.emit({ path, type });

         this.message.success(
            `已成功删除${type === 'file' ? '文件' : '文件夹'}`
         );
      } catch (error) {
         this.message.error(
            `删除${type === 'file' ? '文件' : '文件夹'}时发生错误`
         );
         console.error('Failed to remove item:', error);
      }
   }

   async renameItem(oldPath: string, defaultName: string) {
      const wc = await this.getWebContainerInstance();

      const newName = await dialog.prompt({
         title: '重命名',
         description: '请输入新名称',
         placeholder: '新名称',
         defaultValue: defaultName,
         validator: (value) => {
            if (!value || value.trim().length === 0) {
               return '名称不能为空';
            }
            if (value.includes('/')) {
               return '名称不能包含斜杠';
            }
            return true;
         },
         confirmText: '重命名',
         cancelText: '取消',
      });

      if (!newName) return;

      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');

      try {
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

         // 发送文件移动事件（重命名也是路径变化）
         const fileMoveEmitter = useEventBus<{
            oldPath: string;
            newPath: string;
         }>('file-move-event');
         fileMoveEmitter.emit({ oldPath, newPath });
      } catch (error) {
         this.message.error(
            '重命名失败',
            '重命名时发生错误，请检查名称是否已存在'
         );
         console.error('Failed to rename item:', error);
      }
   }

   async moveItem(oldPath: string, newPath: string) {
      const wc = await this.getWebContainerInstance();

      // 检查目标路径是否已存在
      try {
         await wc.fs.readFile(newPath);
         this.message.warning('移动失败', '目标路径已存在同名文件');
         return;
      } catch {
         try {
            await wc.fs.readdir(newPath);
            this.message.warning('移动失败', '目标路径已存在同名文件夹');
            return;
         } catch {
            // 不存在，继续
         }
      }

      try {
         await wc.fs.rename(oldPath, newPath);

         // 从旧父节点中移除
         const oldParent = this._traverseFindParent(oldPath);
         let itemToMove: IFileSystemItem | undefined;

         if (oldParent && oldParent.children) {
            itemToMove = oldParent.children.find(
               (item) => item.path === oldPath
            );
            if (itemToMove) {
               oldParent.children = oldParent.children.filter(
                  (item) => item.path !== oldPath
               );
            }
         } else if (this.fsTree.value) {
            // 根级别的节点
            itemToMove = this.fsTree.value.find(
               (item) => item.path === oldPath
            );
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

         const movedItem = {
            ...itemToMove,
            name: newName,
            path: newPath,
            suspense: true,
         };
         updatePaths(movedItem, oldPath, newPath);

         if (newParent && newParent.children) {
            newParent.children.push(movedItem);
         } else if (this.fsTree.value) {
            // 根级别的节点
            this.fsTree.value.push(movedItem);
         }

         // 发送文件移动事件
         const fileMoveEmitter = useEventBus<{
            oldPath: string;
            newPath: string;
         }>('file-move-event');
         fileMoveEmitter.emit({ oldPath, newPath });
      } catch (error) {
         this.message.error('移动失败', '移动文件时发生错误');
         console.error('Failed to move item:', error);
      }
   }

   async createFile(path: string, fileName?: string) {
      const wc = await this.getWebContainerInstance();

      const name =
         fileName ||
         (await dialog.prompt({
            title: '新建文件',
            description: '请输入文件名',
            placeholder: 'index.html',
            defaultValue: 'new-file.txt',
            validator: (value) => {
               if (!value || value.trim().length === 0) {
                  return '文件名不能为空';
               }
               if (value.includes('/')) {
                  return '文件名不能包含斜杠';
               }
               return true;
            },
            confirmText: '创建',
            cancelText: '取消',
         }));

      if (!name) return;

      const filePath = `${path}/${name}`;

      try {
         await wc.fs.writeFile(filePath, ' ');

         // 找到父节点并添加新文件
         const parent = this._traverseFindParent(filePath);
         const newFile: IFileSystemItem = {
            name,
            path: filePath,
            type: 'file',
            suspense: true, // 标记为悬空，让组件去加载内容
         };

         if (parent && parent.children) {
            parent.children.push(newFile);
         } else if (this.fsTree.value) {
            // 根级别的文件
            const pathParts = filePath.split('/').filter(Boolean);
            if (pathParts.length === 1) {
               this.fsTree.value.push(newFile);
            }
         }
      } catch (error) {
         this.message.error(
            '创建失败',
            '创建文件时发生错误，请检查文件名是否已存在'
         );
         console.error('Failed to create file:', error);
      }
   }

   async createDirectory(path: string, dirName?: string) {
      const wc = await this.getWebContainerInstance();

      const name =
         dirName ||
         (await dialog.prompt({
            title: '新建文件夹',
            description: '请输入文件夹名',
            placeholder: 'components',
            defaultValue: 'new-folder',
            validator: (value) => {
               if (!value || value.trim().length === 0) {
                  return '文件夹名不能为空';
               }
               if (value.includes('/')) {
                  return '文件夹名不能包含斜杠';
               }
               return true;
            },
            confirmText: '创建',
            cancelText: '取消',
         }));

      if (!name) return;

      const dirPath = `${path}/${name}`;

      try {
         await wc.fs.mkdir(dirPath);

         // 找到父节点并添加新文件夹
         const parent = this._traverseFindParent(dirPath);
         const newFolder: IFileSystemItem = {
            name,
            path: dirPath,
            type: 'folder',
            children: [],
            suspense: true,
         };

         if (parent && parent.children) {
            parent.children.push(newFolder);
         } else if (this.fsTree.value) {
            // 根级别的文件夹
            const pathParts = dirPath.split('/').filter(Boolean);
            if (pathParts.length === 1) {
               this.fsTree.value.push(newFolder);
            }
         }
      } catch (error) {
         this.message.error(
            '创建失败',
            '创建文件夹时发生错误，请检查文件夹名是否已存在'
         );
         console.error('Failed to create directory:', error);
      }
   }

   async copyItem(path: string, type: 'file' | 'folder') {
      // 将复制的项目信息发送给 UI
      const copyEventEmitter = useEventBus<{
         type: 'file' | 'folder';
         path: string;
         isCut: boolean;
      }>('file-copy-event');
      copyEventEmitter.emit({ type, path, isCut: false });

      this.message.success(
         `已复制${type === 'file' ? '文件' : '文件夹'}: ${path
            .split('/')
            .pop()}`
      );
   }

   async cutItem(path: string, type: 'file' | 'folder') {
      // 将剪切的项目信息发送给 UI
      const copyEventEmitter = useEventBus<{
         type: 'file' | 'folder';
         path: string;
         isCut: boolean;
      }>('file-copy-event');
      copyEventEmitter.emit({ type, path, isCut: true });

      this.message.success(
         `已剪切${type === 'file' ? '文件' : '文件夹'}: ${path
            .split('/')
            .pop()}`
      );
   }

   async pasteItem(
      targetPath: string,
      targetType: 'file' | 'folder',
      copiedItem: { type: 'file' | 'folder'; path: string; isCut: boolean }
   ) {
      const wc = await this.getWebContainerInstance();

      // 如果目标是文件,则粘贴到其父文件夹
      const destDir =
         targetType === 'file'
            ? targetPath.split('/').slice(0, -1).join('/')
            : targetPath;

      const sourceName = copiedItem.path.split('/').pop()!;
      const destPath = `${destDir}/${sourceName}`;

      // 如果是剪切操作且目标路径和源路径相同,则不执行
      if (copiedItem.isCut && copiedItem.path === destPath) {
         return;
      }

      // 检查目标路径是否已存在
      try {
         if (copiedItem.type === 'file') {
            await wc.fs.readFile(destPath);
         } else {
            await wc.fs.readdir(destPath);
         }

         this.message.warning('粘贴失败', '目标位置已存在同名文件或文件夹');
         return;
      } catch {
         // 不存在，可以继续
      }

      try {
         if (copiedItem.isCut) {
            // 剪切操作：移动文件或文件夹
            await this.moveItem(copiedItem.path, destPath);
            this.message.success(
               `已成功移动${copiedItem.type === 'file' ? '文件' : '文件夹'}`
            );
         } else {
            // 复制操作
            if (copiedItem.type === 'file') {
               // 复制文件
               const content = await wc.fs.readFile(copiedItem.path, 'utf-8');
               await wc.fs.writeFile(destPath, content);
            } else {
               // 复制文件夹（递归）
               await this._copyDirectory(wc, copiedItem.path, destPath);
            }

            // 添加到 fsTree
            const parent = this._traverseFindParent(destPath);
            const newItem: IFileSystemItem = {
               name: sourceName,
               path: destPath,
               type: copiedItem.type,
               ...(copiedItem.type === 'folder'
                  ? { children: [], suspense: true }
                  : { suspense: true }),
            };

            if (parent && parent.children) {
               parent.children.push(newItem);
            } else if (this.fsTree.value) {
               const pathParts = destPath.split('/').filter(Boolean);
               if (pathParts.length === 1) {
                  this.fsTree.value.push(newItem);
               }
            }

            this.message.success(
               `已成功粘贴${copiedItem.type === 'file' ? '文件' : '文件夹'}`
            );
         }
      } catch (error) {
         this.message.error(
            copiedItem.isCut ? '移动失败' : '粘贴失败',
            copiedItem.isCut ? '移动时发生错误' : '粘贴时发生错误'
         );
         console.error('[ERROR] Failed to paste/move item:', error);
      }
   }

   private async _copyDirectory(
      wc: WebContainer,
      sourcePath: string,
      destPath: string
   ) {
      // 创建目标文件夹
      await wc.fs.mkdir(destPath);

      // 读取源文件夹内容
      const items = await wc.fs.readdir(sourcePath, { withFileTypes: true });

      // 递归复制每个项目
      for (const item of items) {
         const sourceItemPath = `${sourcePath}/${item.name}`;
         const destItemPath = `${destPath}/${item.name}`;

         if (item.isDirectory()) {
            await this._copyDirectory(wc, sourceItemPath, destItemPath);
         } else {
            const content = await wc.fs.readFile(sourceItemPath, 'utf-8');
            await wc.fs.writeFile(destItemPath, content);
         }
      }
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
   const dispatcher = new FileSystemDispatcher(
      props.getWebContainerInstance,
      props.fsTree
   );

   const commandEmitter = useEventBus<CommandData>('right-click-menu-command');

   // 存储复制/剪切的项目
   const copiedItem = ref<{
      type: 'file' | 'folder';
      path: string;
      isCut: boolean;
   } | null>(null);
   const copyEventEmitter = useEventBus<{
      type: 'file' | 'folder';
      path: string;
      isCut: boolean;
   }>('file-copy-event');

   // 在组件 setup 阶段立即初始化 message 和 operator
   const message = useMessage();
   const operator = new FileSystemOperator(
      props.getWebContainerInstance,
      props.fsTree,
      message
   );

   onMounted(() => {
      copyEventEmitter.on((data) => {
         copiedItem.value = data;
      });
   });

   const listener = async (commandData: CommandData) => {
      switch (commandData.type) {
         case 'copy': {
            await operator.copyItem(
               commandData.target.path,
               commandData.target.type
            );
            break;
         }
         case 'cut': {
            await operator.cutItem(
               commandData.target.path,
               commandData.target.type
            );
            break;
         }
         case 'paste': {
            if (!copiedItem.value) return;
            await operator.pasteItem(
               commandData.target.path,
               commandData.target.type,
               copiedItem.value
            );
            // 如果是剪切操作，粘贴后清空剪切项
            if (copiedItem.value.isCut) {
               copiedItem.value = null;
            }
            break;
         }
         case 'remove': {
            await operator.removeItem(
               commandData.target.path,
               commandData.target.type
            );
            break;
         }
         case 'rename': {
            const currentName = commandData.target.path.split('/').pop() || '';
            await operator.renameItem(commandData.target.path, currentName);
            break;
         }
         case 'move': {
            // 通过 prompt 获取目标路径
            const newPath = await dialog.prompt({
               title: '移动',
               description: '请输入目标路径',
               placeholder: '/project/src',
               defaultValue: commandData.target.path,
               confirmText: '移动',
               cancelText: '取消',
            });
            if (!newPath) return;
            await operator.moveItem(commandData.target.path, newPath);
            break;
         }
         case 'add-file': {
            // 如果是文件，在其父文件夹创建；如果是文件夹，在其内部创建
            const targetPath =
               commandData.target.type === 'file'
                  ? commandData.target.path.split('/').slice(0, -1).join('/')
                  : commandData.target.path;
            await operator.createFile(targetPath);
            break;
         }
         case 'add-folder': {
            // 如果是文件，在其父文件夹创建；如果是文件夹，在其内部创建
            const targetPath =
               commandData.target.type === 'file'
                  ? commandData.target.path.split('/').slice(0, -1).join('/')
                  : commandData.target.path;
            await operator.createDirectory(targetPath);
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
