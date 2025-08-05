import Docker from 'dockerode';
import { Singleton } from '../utils/singleton.js';
import { TempFileService } from './temp-file.js';
import JRTP from '@challenge/judge-machine';
import type z from 'zod';
import type { JudgeResultSchema } from '@challenge/judge-machine/schemas';
import { EventEmitterService } from '../utils/event-emitter.js';
import { EventType } from '../events/index.js';
import { ignoreError } from '../utils/ignore-error.js';

export class DockerService extends Singleton {
   static get instance() {
      return this.getInstance<DockerService>();
   }

   private constructor(
      public readonly docker = new Docker(),
      public readonly networkName = 'orange-network',
      public liveServerStartTimeout = 10 * 1000,
      public judgeMachineWs: WebSocket | null = null,
      public judgeMachineContainer: Docker.Container | null = null
   ) {
      super();
   }

   async init() {
      try {
         // 检查网络是否已存在
         const existingNetworks = await this.docker.listNetworks({
            filters: { name: [this.networkName] },
         });

         if (existingNetworks.length === 0) {
            const network = await this.docker.createNetwork({
               Name: this.networkName,
               CheckDuplicate: true,
               Driver: 'bridge',
            });
            console.log('Created network:', network.id);
            return;
         }

         console.log(`Network ${this.networkName} already exists`);
      } catch (error) {
         console.error('Error creating network:', error);
      }

      try {
         const result = await this.startPlaywrightContainer();
         this.judgeMachineWs = result.ws;
         this.judgeMachineContainer = result.container;

         console.log('Judge machine container started:', result.containerId);
      } catch (error: any) {
         throw new Error(
            `Failed to start Playwright container: ${error.message}`
         );
      }
   }

   async startLiveServerContainer(fsSnapshot: Record<string, string>) {
      const { fsName, fsRootPath } =
         await TempFileService.instance.restoreFileSystem(fsSnapshot);

      const createContainer = async () => {
         const container = await this.docker.createContainer({
            Image: 'node-pnpm-liveserver',
            HostConfig: {
               Mounts: [
                  {
                     Type: 'bind',
                     Source: fsRootPath,
                     Target: '/app',
                     ReadOnly: false,
                  },
               ],
               AutoRemove: true,
            },
            NetworkingConfig: {
               EndpointsConfig: {
                  [this.networkName]: {
                     Aliases: [fsName],
                  },
               },
            },
         });

         const startProcess = await container.attach({
            stream: true,
            stdout: true,
            stderr: true,
         });
         await container.start();

         const waitForReady = new Promise<void>((resolve, reject) => {
            let hasReady = false;

            // 设置超时，防止容器长时间未响应
            setTimeout(() => {
               if (hasReady) return;
               reject(new Error('Container did not start in time'));
               ignoreError(() => container.stop());
            }, this.liveServerStartTimeout);

            const onData = (data: Buffer) => {
               const output: string = data.toString();
               if (output.includes('Ready')) {
                  hasReady = true;
                  resolve();
                  startProcess.off('data', onData);
               }
            };

            startProcess.on('data', onData);
         });

         return {
            startProcess,
            containerId: container.id,
            fsName,
            fsRootPath,
            container,
            waitForReady,
            networkUrl: `http://${fsName}:3000`,
            close: async () => {
               await ignoreError(() => container.stop());
               await TempFileService.instance.cleanup(fsRootPath);
            },
         };
      };

      try {
         return await createContainer();
      } catch (error) {
         console.error('Error starting live server container:', error);
         await TempFileService.instance.cleanup(fsRootPath);
         throw error;
      }
   }

   async startPlaywrightContainer() {
      const container = await this.docker.createContainer({
         Image: 'node-playwright-judge-machine',
         HostConfig: {
            AutoRemove: true,
            PortBindings: {
               '3000/tcp': [{ HostPort: '1889' }],
            },
         },
         ExposedPorts: {
            '3000/tcp': {},
         },
         NetworkingConfig: {
            EndpointsConfig: {
               [this.networkName]: {
                  Aliases: ['judge-machine'],
               },
            },
         },
      });

      const startProcess = await container.attach({
         stream: true,
         stdout: true,
         stderr: true,
      });

      await container.start();
      await new Promise<void>((resolve, reject) => {
         let hasReady = false;

         // 设置超时，防止容器长时间未响应
         setTimeout(() => {
            if (hasReady) return;
            reject(new Error('Container did not start in time'));
            ignoreError(() => container.stop());
         }, this.liveServerStartTimeout);

         const onData = (data: Buffer) => {
            const output: string = data.toString();
            if (output.includes('Server is running')) {
               hasReady = true;
               resolve();
               startProcess.off('data', onData);
            }
         };

         startProcess.on('data', onData);
      });

      const ws = await this.connectWebSocket();

      return {
         startProcess,
         containerId: container.id,
         container,
         ws,
      };
   }

   async connectWebSocket() {
      const ws = new WebSocket(`ws://localhost:1889/link`);
      await new Promise<void>((resolve) => {
         ws.addEventListener('open', () => {
            resolve();

            // 定时发送心跳包，保持连接活跃
            const timer = setInterval(() => {
               ws.send('ping');
            }, 30 * 1000);

            ws.addEventListener('close', () => {
               clearInterval(timer);
            });
         });
      });

      const jrtp = new JRTP();
      type JudgeResultType = z.infer<typeof JudgeResultSchema>;
      ws.addEventListener('message', async (event) => {
         const eventData = event.data as Blob;
         const arrayBuffer = await eventData.arrayBuffer();
         const buffer = Buffer.from(arrayBuffer);
         const data = jrtp.unpack(buffer) as JudgeResultType;
         EventEmitterService.instance.emit(EventType.JUDGE_FINISHED, data);
      });

      return ws;
   }

   async destroy() {
      try {
         const containers = await this.docker.listContainers({
            all: true,
            filters: { network: [this.networkName] },
         });

         for (const containerInfo of containers) {
            const container = this.docker.getContainer(containerInfo.Id);
            ignoreError(() => container.stop());
         }

         const networks = await this.docker.listNetworks({
            filters: { name: [this.networkName] },
         });

         for (const network of networks) {
            await this.docker.getNetwork(network.Id).remove();
         }
      } catch (error) {
         console.error('Error during DockerService cleanup:', error);
      }
   }
}
