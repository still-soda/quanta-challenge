import { QueueService } from '../services/queue';
import { judgeProcessor } from './judge-processor/index';
import { initTaskResultHandlers } from './result-handler';

export const initMq = async () => {
   QueueService.instance.initWorkers('judge-task', judgeProcessor, {
      count: 3,
   });
   initTaskResultHandlers();
};
