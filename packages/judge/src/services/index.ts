import { DockerService } from './docker.js';
import { QueueService } from './queue.js';
import { RedisService } from './redis.js';

export const initServices = async () => {
   await DockerService.instance.init();
};

export const destroyServices = async () => {
   QueueService.instance.destroy();
   RedisService.instance.destroy();
   DockerService.instance.destroy();
};
