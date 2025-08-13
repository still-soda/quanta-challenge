import { WorkerPool } from '../../utils/worker-pool';
import { ThumbHashWorker } from './worker';
import WorkerConstructor from './worker?worker';

const workerPool = new WorkerPool<ThumbHashWorker>(WorkerConstructor);

interface IThumbHashResult {
   imageUrl: string;
   width: number;
   height: number;
}

export const batchConvertHashToImageUrl = async (
   hashList: string[]
): Promise<IThumbHashResult[]> => {
   if (hashList.length === 0) {
      return [];
   }

   const workerCount = workerPool.workerCount;
   const chunkSize = Math.ceil(hashList.length / workerCount);

   // 将hashList分割成chunks，每个worker处理一个chunk
   const chunks: string[][] = [];
   for (let i = 0; i < hashList.length; i += chunkSize) {
      chunks.push(hashList.slice(i, i + chunkSize));
   }

   // 为每个chunk创建一个处理任务
   const tasks = chunks.map((chunk) => {
      return async (): Promise<IThumbHashResult[]> => {
         const results: IThumbHashResult[] = [];
         for (const hash of chunk) {
            try {
               const result = await workerPool.runTask((worker) =>
                  worker.convertToImageUrl(hash)
               );
               results.push(result);
            } catch (error) {
               console.error(`Error converting hash ${hash}:`, error);
               results.push({ imageUrl: '', width: 0, height: 0 }); // 错误情况的默认值
            }
         }
         return results;
      };
   });

   // 并行执行所有任务并合并结果
   const resultChunks = await Promise.all(tasks.map((task) => task()));
   return resultChunks.flat();
};
