import { JRTP } from '../../protocol/judge-result-transfer-protocal.js';
import { EventType, type EventMessage } from '../events/index.js';
import { defineTestHandler, getExposePage, System } from '../lib/system.js';
import { TaskSchema } from '../schemas/task.js';
import { Singleton } from '../utils/singleton.js';
import { EventEmitterService } from './event-emitter.js';
import { PlaywrightService } from './playwright.js';
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
      const listenMessage = () => {
         this.eventEmitter.on(EventType.MESSAGE, (msg) => this.handleTask(msg));
      };
      this.eventEmitter.on(EventType.OPEN, listenMessage);
      this.eventEmitter.on(EventType.CLOSE, () => {
         this.eventEmitter.off(EventType.OPEN, listenMessage);
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
               judgeTime: 0,
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
               judgeTime: 0,
            })
         );
         return;
      }
      const payload = validateResult.data;

      // Do judge
      const cleanupFns = new Array<() => Promise<void>>();
      const startTime = Date.now();
      try {
         const { page, close } = await PlaywrightService.instance.openPage(
            payload.url
         );
         cleanupFns.push(() => close());

         const system = new System(payload.mode, payload.info);
         const vm = new VM({
            sandbox: {
               defineTestHandler,
               page: getExposePage(page),
               system,
            },
            timeout: 10 * 1000,
         });
         type TestHandler = ReturnType<typeof defineTestHandler>;
         const script = payload.judgeScript.replace(
            'export default ',
            'const run = '
         );
         const result: Awaited<ReturnType<TestHandler>> = await vm.run(`
            ${script}
            run(page, system);
         `);

         ws.send(
            this.jrtp.pack({
               ...result,
               type: 'done',
               message: 'Judge completed successfully',
               judgeTime: Date.now() - startTime,
               judgeRecordId: payload.judgeRecordId,
            })
         );
      } catch (error: any) {
         ws.send(
            this.jrtp.pack({
               type: 'error',
               message: error.message,
               judgeTime: Date.now() - startTime,
               judgeRecordId: payload.judgeRecordId,
            })
         );
      }

      cleanupFns.forEach((fn) => fn());
   }
}
