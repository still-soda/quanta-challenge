import { existsSync } from 'fs';
import path from 'path';

/**
 * 解析本地存储（local_store）的绝对路径。
 *
 * 关于为什么不能直接用 `process.env.LOCAL_STORE_PATH || './local_store'`：
 * 相对路径是按**进程 cwd** 解析的，而判题调度器与 Web 应用分别在各自包目录下启动
 * （`packages/challenge-judge-scheduler` 与 `packages/challenge-web-app`）。
 * 于是同一句 `./local_store` 变成了两个不同目录：
 *   - 调度器把判题首屏截图（= 题目默认封面）写进 packages/challenge-judge-scheduler/local_store
 *   - Web 应用的 /api/static 却从 packages/challenge-web-app/local_store 读
 * 结果所有题目封面 404，页面只能显示 `<img>` 的 alt 文本（"Cover Image"）。
 *
 * 这里统一锚定到 monorepo 根目录（通过 pnpm-workspace.yaml 识别），
 * 两个进程即使 cwd 不同也会指向同一个绝对路径。
 */

/** 向上查找 monorepo 根目录；找不到就退回起点，保证函数不会抛错。 */
const findRepoRoot = (startDir: string): string => {
   let current = startDir;
   for (let i = 0; i < 12; i++) {
      if (existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
   }
   return startDir;
};

/**
 * 返回 local_store 的绝对路径。
 *
 * 优先级：
 * 1. LOCAL_STORE_PATH 为绝对路径 -> 直接用
 * 2. LOCAL_STORE_PATH 为相对路径 -> 先按仓库根目录解析（存在则采用），
 *    否则退回按 cwd 解析，兼容旧行为
 * 3. 未配置 -> 仓库根目录下的 packages/challenge-web-app/local_store
 *    （与 docker-compose 给 Web 应用挂载的卷路径一致）
 */
export const resolveLocalStorePath = (): string => {
   const configured = process.env.LOCAL_STORE_PATH?.trim();

   if (configured) {
      if (path.isAbsolute(configured)) return path.resolve(configured);

      const root = findRepoRoot(process.cwd());
      const fromRoot = path.resolve(root, configured);
      if (existsSync(fromRoot)) return fromRoot;

      return path.resolve(process.cwd(), configured);
   }

   const root = findRepoRoot(process.cwd());
   return path.join(root, 'packages', 'challenge-web-app', 'local_store');
};

/** 供调试用：把解析结果与其来源一并打印出来。 */
export const describeLocalStorePath = (): string => {
   const resolved = resolveLocalStorePath();
   const source = process.env.LOCAL_STORE_PATH?.trim()
      ? `LOCAL_STORE_PATH=${process.env.LOCAL_STORE_PATH}`
      : '默认（仓库根/packages/challenge-web-app/local_store）';
   return `${resolved}  [${source}]`;
};
