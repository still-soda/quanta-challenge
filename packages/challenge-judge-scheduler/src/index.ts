import { serve } from '@hono/node-server';
import app from './controllers/index';
import { initMq } from './mq/index';
import { destroyServices, initServices } from './services/index';

const startApp = async () => {
   console.log('正在初始化服务依赖...');
   await initMq();
   await initServices();
   console.log('服务依赖初始化完成');
};

if (process.env.NODE_ENV === 'production') {
   await startApp();

   const port = Number(process.env.PORT ?? 3000);
   try {
      console.log(`[PROD] 尝试启动服务器在端口 ${port}...`);
      serve({ fetch: app.fetch, port })
         .once('close', destroyServices)
         .once('listening', () => {
            console.log(`[INFO] Server is running on http://localhost:${port}`);
         });
   } catch (error) {
      console.error(`[ERROR] 服务器启动失败: ${error}`);
   }
} else {
   startApp().catch((err) => {
      console.error('[DEV] 初始化依赖失败:', err);
   });
}

export default app;
