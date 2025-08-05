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
   console.log('Received message:', message);

   const buffer: Buffer =
      message.results[0].cacheFiles['button-click-increment.png'];
   await fs.writeFile('button-click-increment.png', buffer);

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
      judgeRecordId: 0,
      judgeScript: script,
      mode: 'audit',
      url: 'http://2b9b5283-eb1a-41d8-aca5-7c73c9bb9d82:3000/',
   } satisfies z.infer<typeof TaskSchema>)
);
