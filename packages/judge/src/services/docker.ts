import Docker from 'dockerode';
import { Singleton } from '../utils/singleton.js';
import { TempFileService } from './temp-file.js';

export class DockerService extends Singleton {
   static get instance() {
      return this.getInstance<DockerService>();
   }

   private constructor(
      public readonly docker = new Docker(),
      public readonly networkName = 'orange-network',
      public liveServerStartTimeout = 10 * 1000
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
            ExposedPorts: {
               '3000/tcp': {},
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
               container.stop();
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

   async startPlaywrightContainer() {}

   async destroy() {
      try {
         const containers = await this.docker.listContainers({
            all: true,
            filters: { network: [this.networkName] },
         });

         for (const containerInfo of containers) {
            const container = this.docker.getContainer(containerInfo.Id);
            await container.stop();
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
