// 必须使用「默认导入再解构」的写法。
//
// @prisma/client 的入口是 CommonJS，其 default.js 形如：
//   module.exports = { ...require('<绝对路径>.prisma/client/default') }
// 其中的 require 参数是动态表达式，Node 的 CJS 具名导出探测（cjs-module-lexer）
// 无法静态分析出 PrismaClient，因此在 ESM 下用 `import { PrismaClient }` 会报
// "Named export 'PrismaClient' not found"。改为默认导入后解构即可正确取到。
import prismaClientPkg from '@prisma/client';

const { PrismaClient } = prismaClientPkg;

const prismaClientSingleton = () => {
   return new PrismaClient();
};

declare const globalThis: {
   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
