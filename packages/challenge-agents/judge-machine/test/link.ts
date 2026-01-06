import type z from 'zod';
import JRTP from '../protocol';
import type { TaskSchema } from '../src/schemas/task';
import fs from 'fs/promises';

const ws = new WebSocket('ws://localhost:1889/link');

await new Promise<void>((resolve) => {
   ws.addEventListener('open', () => {
      resolve();
   });
});

ws.onmessage = async (event) => {
   const jrtp = new JRTP();
   const message = jrtp.unpack(event.data);
   console.log('[INFO] Received message:', message);

   // const buffer: Buffer =
   //    message.results[0].cacheFiles['button-click-increment.png'];
   // await fs.writeFile('button-click-increment.png', buffer);

   process.exit(0);
};

const script = `export default defineTestHandler(async ({ page, $ }) => {
   $.defineCheckPoint('测试按钮点击自增', 10, async () => {
      const screenshot = await page.screenshot();
      await $.saveOrCompare({
         type: 'image',
         name: 'button-click-increment.png',
         buffer: screenshot,
      });
      return 10;
   });
});`;

ws.send(
   JSON.stringify({
      judgeRecordId: 128,
      judgeScript: script,
      mode: 'judge',
      url: 'http://9803b872-81b5-4bdf-8d9c-3cc16f949c67:3000/',
      info: {},
   } satisfies z.infer<typeof TaskSchema>)
);
