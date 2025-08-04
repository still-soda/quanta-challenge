import { JRTP } from '../../protocol/judge-result-transfer-protocal.js';
import {
   getExposePage,
   System,
   type defineTestHandler,
} from '../../sandbox/lib/system.js';
import { EventType, type EventMessage } from '../events/index.js';
import { TaskSchema } from '../schemas/task.js';
import { Singleton } from '../utils/singleton.js';
import { EventEmitterService } from './event-emitter.js';
import { PlaywrightService } from './playwright.js';
import { TempFileService } from './temp-file.js';
import { VM } from 'vm2';

export class JudgeService extends Singleton {
   static get instance() {
      return this.getInstance<JudgeService>();
   }

   private constructor(
      private readonly eventEmitter = EventEmitterService.instance,
      private readonly jrtp = new JRTP()
   ) {
      super();
   }

   async init() {
      this.eventEmitter.on(EventType.OPEN, () => {
         this.eventEmitter.on(EventType.MESSAGE, (msg) => this.handleTask(msg));
      });
   }

   async handleTask(options: EventMessage['MESSAGE']) {
      const { ws } = options;

      let data: Record<string, any>;
      try {
         data = JSON.parse(options.data as string);
      } catch (error: any) {
         ws.send(
            this.jrtp.pack({
               type: 'error',
               message: 'Invalid JSON format',
            })
         );
         return;
      }

      // Validate the task data
      const validateResult = TaskSchema.safeParse(data);
      if (!validateResult.success) {
         ws.send(
            this.jrtp.pack({
               type: 'error',
               message: validateResult.error.message,
            })
         );
         return;
      }
      const payload = validateResult.data;

      const cleanupFns = new Array<() => Promise<void>>();
      try {
         const startTime = performance.now();

         const { page, close } = await PlaywrightService.instance.openPage(
            payload.url
         );
         cleanupFns.push(() => close());

         const { filePath } = await TempFileService.instance.writeTempFile(
            payload.judgeScript
         );
         cleanupFns.push(() =>
            TempFileService.instance.clearTempFile(filePath)
         );

         const { defalt: testHandler } = (await import(filePath)) as {
            defalt: ReturnType<typeof defineTestHandler>;
         };

         const system = new System();
         const vm = new VM({
            sandbox: {
               page: getExposePage(page),
               system,
            },
            timeout: 10 * 1000,
         });
         const result: Awaited<ReturnType<typeof testHandler>> = await vm.run(
            `await (${testHandler.toString()})(page, system)`
         );

         ws.send(
            this.jrtp.pack({
               ...result,
               type: 'result',
               message: 'Judge completed successfully',
               judgeTime: performance.now() - startTime,
            })
         );
      } catch (error: any) {
         ws.send(
            this.jrtp.pack({
               type: 'error',
               message: error.message,
            })
         );
      }

      cleanupFns.forEach((fn) => fn());
   }
}
