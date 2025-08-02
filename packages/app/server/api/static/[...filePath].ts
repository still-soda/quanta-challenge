// server/routes/files/[...filePath].ts
import { createReadStream } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
   const filePath = event.context.params?.filePath;
   if (!filePath || !Array.isArray(filePath)) {
      throw createError({
         statusCode: 400,
         statusMessage: 'Missing file path',
      });
   }

   const base = process.env.LOCAL_STORE_PATH || './local_store';
   const fullPath = join(base, ...filePath);

   try {
      await readFile(fullPath);
      return sendStream(event, createReadStream(fullPath));
   } catch (err) {
      throw createError({ statusCode: 404, statusMessage: 'File not found' });
   }
});
