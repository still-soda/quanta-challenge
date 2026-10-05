import { defineConfig } from 'vite';
import devServer from '@hono/vite-dev-server';

export default defineConfig({
   plugins: [
      devServer({
         entry: 'src/index.ts',
      }),
   ],
   build: {
      sourcemap: true,
      ssr: true,
      target: 'esnext',
      lib: {
         entry: 'src/index.ts',
         formats: ['es'],
         fileName: 'index',
      },
      rollupOptions: {
         output: {
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: '[name].js',
            format: 'esm',
         },
         // 哪些 import 保持为外部引用（运行期再从 node_modules 解析）。
         //
         // 两条必须遵守的规则：
         // 1) 排除 Windows 绝对路径。Vite 传给 external 的 id 对入口而言是**绝对路径**
         //    （如 F:\repo\packages\...\src\index.ts），而 Windows 路径既不以 '.' 也不以
         //    '/' 开头，会被误判为裸模块名，导致入口自身被判为 external，Rollup 直接报
         //    "Entry module cannot be external"。该 bug 只在 Windows 上必现。
         // 2) 排除 @challenge/* 这类 workspace 包。它们的 exports 指向 **TypeScript 源码**
         //    （如 @challenge/shared -> service/store/index.ts），且源码内部使用无扩展名
         //    相对导入（'./local-store'）。若保持 external，运行时就变成"用 Node 原生类型
         //    剥离去直接解析 workspace 源码"，而原生解析要求显式扩展名，必然报
         //    ERR_MODULE_NOT_FOUND。因此这些包必须在构建期打包进产物
         //    （与下方 ssr.noExternal 的意图一致）。
         external: (id) =>
            !id.startsWith('.') &&
            !id.startsWith('/') &&
            !/^[A-Za-z]:[\\/]/.test(id) &&
            !id.startsWith('@challenge/'),
      },
   },
   ssr: {
      noExternal: [/@challenge\/.*/],
      external: ['ssh2'],
   },
   server: {
      port: 1888,
   },
});
