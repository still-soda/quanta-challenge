import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prismaClientPath = path.join(
   __dirname,
   '../../../node_modules/.pnpm/@prisma+client@6.12.0_prisma@6.12.0_typescript@5.8.3__typescript@5.8.3/node_modules/@prisma/client'
);
const replaceToPath = path.join(
   __dirname,
   '../../../node_modules/.pnpm/@prisma+client@6.12.0_prisma@6.12.0_typescript@5.8.3__typescript@5.8.3/node_modules/.prisma/client'
);

const replacePrismaClientPath = async (filePath: string) => {
   const fs = await import('fs/promises');
   let content = await fs.readFile(filePath, 'utf-8');
   content = content.replace(/'\.prisma\/client/g, `'${replaceToPath}`);
   await fs.writeFile(filePath, content, 'utf-8');
   console.log(`✅ Patched: ${filePath}`);
};

const patchPrismaClient = async () => {
   const files = [
      path.join(prismaClientPath, 'default.js'),
      path.join(prismaClientPath, 'index-browser.js'),
   ];

   for (const file of files) {
      await replacePrismaClientPath(file);
   }
};

await patchPrismaClient();
