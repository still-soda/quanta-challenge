import * as Comlink from 'comlink';

interface IConstructor<T> {
   new (...args: any[]): T;
}

interface IWorkerWithStatus<Processor> {
   worker: Worker;
   proxy: Comlink.Remote<Processor>;
   status: 'idle' | 'busy' | 'error';
}

interface IResolver<Processor> {
   resolve: (worker: Comlink.Remote<Processor>) => void;
   reject: (error: Error) => void;
}

export class WorkerPool<Processor> {
   private workerWithStatusList: IWorkerWithStatus<Processor>[] = [];
   private getWorkerPromiseResolveList: IResolver<Processor>[] = [];

   constructor(
      public readonly WorkerConstructor: IConstructor<Worker>,
      public readonly workerCount: number = navigator?.hardwareConcurrency || 4
   ) {}

   async getWorker(): Promise<Comlink.Remote<Processor>> {
      if (this.workerWithStatusList.length < this.workerCount) {
         const worker = new this.WorkerConstructor();
         const proxy = Comlink.wrap<Processor>(worker);
         this.workerWithStatusList.push({
            worker: worker,
            proxy: proxy,
            status: 'busy',
         });
         return proxy;
      }
      const idleWorker = this.workerWithStatusList.find(
         (w) => w.status === 'idle'
      );
      if (idleWorker) {
         idleWorker.status = 'busy';
         return idleWorker.proxy;
      }
      return new Promise<Comlink.Remote<Processor>>((resolve, reject) => {
         this.getWorkerPromiseResolveList.push({ resolve, reject });
      });
   }

   async releaseWorker(worker: Comlink.Remote<Processor>): Promise<void> {
      if (this.getWorkerPromiseResolveList.length > 0) {
         const { resolve } = this.getWorkerPromiseResolveList.shift() ?? {};
         if (resolve) {
            resolve(worker);
            return;
         }
      }
      const workerWithStatus = this.workerWithStatusList.find(
         (w) => w.proxy === worker
      );
      if (!workerWithStatus) return;
      workerWithStatus.status = 'idle';
   }

   async runTask<T>(task: (worker: Comlink.Remote<Processor>) => Promise<T>) {
      const worker = await this.getWorker();
      const result = await task(worker);
      this.releaseWorker(worker);
      return result;
   }

   async destroy(): Promise<void> {
      for (const { worker } of this.workerWithStatusList) {
         worker.terminate();
      }
      this.workerWithStatusList = [];
      this.getWorkerPromiseResolveList.forEach(({ reject }) => {
         reject(new Error('Worker pool destroyed'));
      });
      this.getWorkerPromiseResolveList = [];
   }
}
