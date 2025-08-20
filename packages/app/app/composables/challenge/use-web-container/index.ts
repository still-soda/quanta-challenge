import type { WebContainer } from '@webcontainer/api';
import { convertToFsTree } from './convert-to-fs-tree';
import { convertToPathContentMap } from './convert-to-path-content-map';

type WebContainerApi = typeof import('@webcontainer/api').WebContainer;
let instance: WebContainer | null = null;

const initWebContainer = async (
   WebContainer: WebContainerApi,
   options?: IUseWebContainerOptions
) => {
   instance = await WebContainer.boot({
      workdirName: options?.workdirName,
   });
};

export interface IUseWebContainerOptions {
   workdirName?: string;
}

type WebContainerReadyCallback = (wc: WebContainer) => void;

export const useWebContainer = (options?: IUseWebContainerOptions) => {
   const webContainerReadyCallbacks = new Set<WebContainerReadyCallback>();
   const onWebContainerReady = (callback: WebContainerReadyCallback) => {
      if (instance) {
         return callback(instance);
      }
      webContainerReadyCallbacks.add(callback);
   };

   const getInstance = async () => {
      return new Promise<WebContainer>((resolve) => {
         onWebContainerReady((instance) => {
            resolve(instance);
         });
      });
   };

   const mountFileSystem = (pathContentMap: Record<string, string>) => {
      const fsTree = convertToFsTree(pathContentMap);
      return new Promise<void>(async (resolve, reject) => {
         const instance = await getInstance();
         try {
            await instance.mount(fsTree);
            resolve();
         } catch (error) {
            reject(error);
         }
      });
   };

   const makeSnapshot = (dirPath: string) => {
      return new Promise<Record<string, string>>(async (resolve, reject) => {
         const instance = await getInstance();
         try {
            const fsTree = await instance.export(dirPath, {
               format: 'json',
            });
            resolve(convertToPathContentMap(fsTree));
         } catch (error) {
            reject(error);
         }
      });
   };

   const writeFile = async (path: string, content: string | Uint8Array) => {
      const instance = await getInstance();
      const dir = path.split('/').slice(0, -1).filter(Boolean).join('/');
      try {
         await instance.fs.mkdir(dir, { recursive: true });
         await instance.fs.writeFile(path, content);
      } catch (error) {
         throw new Error(`Failed to create directory: ${error}`);
      }
   };

   const removeFile = async (path: string) => {
      const instance = await getInstance();
      try {
         await instance.fs.rm(path, { recursive: true, force: true });
      } catch (error) {
         throw new Error(`Failed to remove file: ${error}`);
      }
   };

   const runCommand = async (commandLine: string | string[]) => {
      let command: string;
      let args: string[];
      if (typeof commandLine === 'string') {
         const [cmd, ...rest] = commandLine.split(' ');
         if (!cmd) {
            throw new Error('Command not found');
         }
         command = cmd!;
         args = rest;
      } else {
         if (commandLine.length === 0) {
            throw new Error('Command not found');
         }
         command = commandLine[0]!;
         args = commandLine.slice(1);
      }

      const instance = await getInstance();
      return await instance.spawn(command, args);
   };

   const exposeServer = ref<{ port: number; url: string }>();
   const error = ref<{ message: string }>();
   const openedPort = ref<number>();
   const closePort = ref<number>();

   onMounted(async () => {
      const { WebContainer } = await import('@webcontainer/api');

      if (!instance) {
         await initWebContainer(WebContainer, options);
         if (!instance) {
            throw new Error('WebContainer 初始化失败');
         }
         webContainerReadyCallbacks.forEach((callback) => callback(instance!));
      }

      instance.on('server-ready', (port, url) => {
         exposeServer.value = { port, url };
      });

      instance.on('error', (err) => {
         error.value = err;
      });

      instance.on('port', (port, type) => {
         if (type === 'open') {
            openedPort.value = port;
         } else {
            closePort.value = port;
         }
      });
   });

   onUnmounted(() => {
      instance?.teardown();
   });

   return {
      onWebContainerReady,
      mountFileSystem,
      makeSnapshot,
      getInstance,
      writeFile,
      removeFile,
      runCommand,
      exposeServer,
      openedPort,
      closePort,
      error,
   };
};
