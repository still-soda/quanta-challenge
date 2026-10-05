/**
 * dev server 看护进程（watchdog）。
 *
 * ## 为什么需要它
 * `nuxt dev` 在开发期可能被**未处理的连接层错误**（ECONNRESET / ECONNABORTED）终止，
 * 触发时机通常是 Vite 运行中依赖重优化导致的整页重载——浏览器刷新时切断 HMR
 * WebSocket，Node 把这个连接错误升级成进程级异常，dev server 就没了，表现为
 * 浏览器"无法访问"。
 *
 * ## 为什么要退避（backoff）
 * 早期版本固定 1.5 秒重启。当子进程因为**编译错误或内存耗尽（OOM）**反复崩溃时，
 * 1.5 秒一次的重启会让进程堆积、把内存彻底压满，反而放大故障。
 * 因此这里按"连续快速失败次数"做指数退避：
 *   连续快速失败 1 次 → 1.5s，2 次 → 3s，3 次 → 6s …最多 30s。
 * 只要一次运行超过 HEALTHY_RUN_MS（视为正常启动过），计数就清零。
 *
 * ## 使用
 *   pnpm dev:watch     # 带自动重启（日常开发推荐）
 *   pnpm dev           # 原生 nuxt dev（需要看原始行为时用）
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

/** 首次重启延迟 */
const BASE_DELAY_MS = 1500;
/** 退避上限 */
const MAX_DELAY_MS = 30_000;
/** 运行超过该时长即视为"启动成功过"，重置退避计数 */
const HEALTHY_RUN_MS = 20_000;

let consecutiveFastFailures = 0;
let shuttingDown = false;
let child = null;
let startedAt = 0;

const nuxtBin = path.join(projectRoot, 'node_modules', 'nuxt', 'bin', 'nuxt.mjs');

const start = () => {
   startedAt = Date.now();
   child = spawn(process.execPath, [nuxtBin, 'dev', '--host'], {
      cwd: projectRoot,
      // 直接继承 stdio：输出实时可见，也避免在受限环境下尝试创建管道
      stdio: 'inherit',
      env: process.env,
   });

   child.on('exit', (code, signal) => {
      if (shuttingDown) return;

      const ranFor = Date.now() - startedAt;
      const wasHealthy = ranFor >= HEALTHY_RUN_MS;

      if (wasHealthy) {
         // 正常跑过一段时间后才挂：属于偶发，重置退避
         consecutiveFastFailures = 0;
      } else {
         consecutiveFastFailures += 1;
      }

      const delay = Math.min(
         BASE_DELAY_MS * 2 ** Math.max(0, consecutiveFastFailures - 1),
         MAX_DELAY_MS,
      );

      const reason = signal ? `被信号 ${signal} 终止` : `退出码 ${code}`;
      console.error(
         `\n[watchdog] nuxt dev ${reason}（运行了 ${Math.round(ranFor / 1000)}s），` +
            `${Math.round(delay / 1000)}s 后重启` +
            (consecutiveFastFailures > 1
               ? `（连续快速失败 ${consecutiveFastFailures} 次）`
               : '') +
            '…',
      );

      if (consecutiveFastFailures >= 3) {
         console.error(
            '[watchdog] ⚠️ 已连续快速失败多次，退避时间已延长。\n' +
               '           请查看上方日志中的 ERROR。常见原因：\n' +
               '             · 语法/编译错误（Vite: Transform failed）\n' +
               '             · JavaScript heap out of memory（内存不足，' +
               '可先关掉其它 dev 实例；不要与 pnpm typecheck 同时跑，' +
               '二者都会写 .nuxt/）\n' +
               '             · 端口被其它实例占用\n',
         );
      }

      setTimeout(start, delay);
   });
};

// Ctrl+C / 关闭窗口时，连同子进程一起退出，不要留下孤儿进程
const shutdown = () => {
   shuttingDown = true;
   if (child && !child.killed) {
      child.kill();
   }
   process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('[watchdog] 启动 nuxt dev（退出后按指数退避自动重启）…');
start();
