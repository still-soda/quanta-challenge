import { DockerService } from './docker';
import { QueueService } from './queue';
import { RedisService } from './redis';

export const initServices = async () => {
   await DockerService.instance.init();
};

export const destroyServices = async () => {
   QueueService.instance.destroy();
   RedisService.instance.destroy();
   DockerService.instance.destroy();
};
