import { QueueService } from '../services/queue.js';
import { judgeProcessor } from './judge-processor/index.js';
import { initTaskResultHandlers } from './result-handler.js';

export const initMq = async () => {
   QueueService.instance.initWorkers('judge-task', judgeProcessor, {
      count: 3,
   });
   initTaskResultHandlers();
};
