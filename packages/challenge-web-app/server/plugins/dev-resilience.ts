/**
 * 开发期连接层错误兜底：不让 dev server 因为 socket 断开而整体退出。
 *
 * ## 背景（反复出现的现象）
 * ```
 * ERROR  [unhandledRejection] read ECONNRESET
 * ERROR  [unhandledRejection] write ECONNABORTED
 * -> 进程退出，浏览器变成"无法访问"
 * ```
 * 成因：Vite HMR / 预览相关的 socket 在刷新页面、关闭标签、以及依赖重优化触发的
 * 自动重载时被对端关闭，Node 的 net.Socket 抛出 ECONNRESET / ECONNABORTED / EPIPE。
 * 这些属于**正常的连接噪声**，但没人监听时就会变成
 * unhandledRejection / uncaughtException 并终止进程。
 *
 * ## 处理策略（两层）
 * 1. **源头**：给每个新建立的 TCP 连接挂上 'error' 监听。这是最有效的一层——
 *    socket 错误被就地消费，不会升级成进程级异常。
 * 2. **兜底**：进程级处理器只做「记一条日志」，**绝不重新抛出、绝不主动退出**。
 *    （早期版本在 unhandledRejection 里 `throw`，会立刻变成 uncaughtException
 *     并把自己杀掉，反而是新的故障源。）
 */
const IGNORABLE_SOCKET_CODES = new Set([
   'ECONNRESET',
   'ECONNABORTED',
   'EPIPE',
   'ERR_STREAM_WRITE_AFTER_END',
   'ERR_STREAM_DESTROYED',
]);

const errorCode = (e: unknown): string | undefined =>
   (e as NodeJS.ErrnoException | undefined)?.code;

const isIgnorableSocketError = (e: unknown): boolean => {
   const code = errorCode(e);
   return typeof code === 'string' && IGNORABLE_SOCKET_CODES.has(code);
};
const DEDUP_WINDOW_MS = 30_000;

export default defineNitroPlugin(() => {
   // 只在开发环境启用；生产环境的连接错误应由正式日志/监控处理
   if (process.env.NODE_ENV === 'production') return;

   // ---- 第 1 层：源头消化 ----
   // Nitro 开发服务器会把 http server 暴露在 globalThis 上时优先使用它
   const candidates = [
      (globalThis as any).__nitro_http_server,
      (globalThis as any).httpServer,
      (globalThis as any).__nuxt_http_server,
   ].filter(Boolean);

   let attached = 0;
   for (const server of candidates) {
      if (typeof server.on !== 'function') continue;
      server.on('connection', (socket: any) => {
         socket.on('error', (err: unknown) => {
            if (isIgnorableSocketError(err)) return; // 静默消化
            console.error('[dev] socket 错误:', err);
         });
      });
      attached++;
   }

   // ---- 第 2 层：进程级兜底（只记录，不抛出、不退出） ----
   process.on('unhandledRejection', (reason) => {
      if (isIgnorableSocketError(reason)) return; // 连接噪声，无需刷屏
      console.error('[dev] 未处理的 Promise 拒绝（已忽略，服务继续运行）:', reason);
   });

   process.on('uncaughtException', (error) => {
      if (isIgnorableSocketError(error)) return;
      console.error('[dev] 未捕获异常（已忽略，服务继续运行）:', error);
   });

   console.log(
      `[dev] 连接层错误兜底已启用（已挂接 ${attached} 个 http server；` +
         'ECONNRESET / ECONNABORTED / EPIPE 不再终止 dev server）',
   );
});
