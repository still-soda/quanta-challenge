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
         external: (id) => !id.startsWith('.') && !id.startsWith('/'),
      },
   },
   server: {
      port: 3000,
   },
});
