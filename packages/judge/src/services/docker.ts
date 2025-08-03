import Docker from 'dockerode';
import { Singleton } from '../utils/singleton.js';

export class DockerService extends Singleton {
   static get instance() {
      return this.getInstance<DockerService>();
   }

   private constructor(public readonly docker = new Docker()) {
      super();
   }

   async init() {
      const network = await this.docker.createNetwork({
         Name: 'orange-network',
         CheckDuplicate: true,
         Driver: 'bridge',
      });
   }

   async startLiveServerContainer() {
      await this.docker.createContainer({});
   }

   async startPlaywrightContainer() {}
}
