import fs from 'fs/promises';
import path from 'path';

const root = path.resolve('.output/server');

const __dirnameInjectCode = `
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`;

const processFile = async (filePath: string) => {
   let content = await fs.readFile(filePath, 'utf-8');
   if (!content.includes('__dirname')) return;

   // 避免重复注入
   if (!content.includes('const __dirname =')) {
      content = __dirnameInjectCode + '\n' + content;
   }

   await fs.writeFile(filePath, content, 'utf-8');
   console.log(`✅ Patched: ${filePath}`);
};

const scanAndPatch = async (dir: string) => {
   const entries = await fs.readdir(dir, { withFileTypes: true });
   for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
         await scanAndPatch(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.mjs')) {
         await processFile(fullPath);
      }
   }
};

const patchNuxtIgnore = async () => {
   const nuxtConfigPath = path.join(__dirname, '../.nuxtignore');
   let content = await fs.readFile(nuxtConfigPath, 'utf-8');
   const lines = content.split('\n');
   const transformedLines = lines.map((line) => `#${line}`);
   content = transformedLines.join('\n');
   await fs.writeFile(nuxtConfigPath, content, 'utf-8');
   console.log(`✅ Patched: ${nuxtConfigPath}`);
};

await scanAndPatch(root);
await patchNuxtIgnore();
