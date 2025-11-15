import { useMessage } from '~/components/st/Message/use-message';
import { DEFAULT_FILE_SYSTEM_SYNC_INTERVAL } from '../_configs';
import { minimatch } from 'minimatch';

export interface IUseFileChangeSyncOptions {
   ignorePatterns?: string[];
   syncInterval?: number;
}

type Change =
   | { type: 'rm'; path: string }
   | { type: 'mv'; oldPath: string; newPath: string }
   | { type: 'change'; path: string; content: string };

/**
 * 监听文件系统变化，同步到云端
 */
export const useFileChangeSync = (options: IUseFileChangeSyncOptions) => {
   const {
      ignorePatterns = [],
      syncInterval = DEFAULT_FILE_SYSTEM_SYNC_INTERVAL,
   } = options;
   const changeList: Change[] = [];

   const isIgnored = (path: string) => {
      return ignorePatterns.some((pattern) => minimatch(path, pattern));
   };

   const rm = (path: string) => {
      !isIgnored(path) && changeList.push({ type: 'rm', path });
   };

   const mv = (oldPath: string, newPath: string) => {
      !isIgnored(newPath) && changeList.push({ type: 'mv', oldPath, newPath });
   };

   const change = (path: string, value: string) => {
      const existingChange = changeList.find(
         (c) => c.type === 'change' && c.path === path
      );
      if (!existingChange) {
         !isIgnored(path) &&
            changeList.push({ type: 'change', path, content: value });
      } else if (existingChange.type === 'change') {
         existingChange.content = value;
      } else {
         console.error(
            '[ERROR] Inconsistent change type detected:',
            existingChange
         );
      }
   };

   let failedTime = 0;
   const maxFailedTime = 5;
   const message = useMessage();
   const syncChangeToServer = async (changes: Change[]) => {
      try {
         // TODO: 调用 API 同步文件变化到服务器
         console.log('[SYNC]', JSON.stringify(changes));
         failedTime = 0;
      } catch (error) {
         failedTime++;
         changeList.unshift(...changes);
         message.error('同步文件变化到服务器失败，请检查网络连接');
      }
   };

   let alive = true;
   const startSync = () => {
      setTimeout(async () => {
         if (changeList.length === 0) {
            startSync();
            return;
         }

         const changesToSync = [...changeList];
         changeList.length = 0;

         // 调用同步函数
         await syncChangeToServer(changesToSync);

         // 继续下一个周期的同步
         if (failedTime < maxFailedTime) {
            alive && startSync();
         } else {
            message.error('多次同步失败，已停止自动同步，请检查网络连接');
         }
      }, syncInterval);
   };

   onMounted(() => {
      alive = true;
      startSync();
   });

   onUnmounted(() => {
      alive = false;
   });

   return { rm, mv, change };
};
