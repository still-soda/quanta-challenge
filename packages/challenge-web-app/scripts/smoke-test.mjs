#!/usr/bin/env node
/**
 * 一键冒烟测试：按依赖顺序验证整套平台是否可用。
 *
 * 用法：
 *   node scripts/smoke-test.mjs
 *
 * 设计意图：把"到底坏在哪一步"变成一条命令的输出，而不是靠人来回猜。
 * 检查顺序刻意从底层往上，任何一步不过就直接给出该步的修复命令。
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const PG_CONTAINER = 'quanta-challenge-postgres-1';
const REDIS_CONTAINER = 'quanta-challenge-redis-1';
const WEB = 'http://localhost:3000';
const SCHEDULER = 'http://localhost:1888';
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || 'stillsoda123@admin.com';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || 'stillsoda123';

// 用于冒烟判题的题目与正确解（简单求和，pid 19）
const PROBLEM_ID = Number(process.env.SMOKE_PROBLEM_ID || 19);
const ANSWER = {
  'index.html': `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
<input id="a"><input id="b"><button id="sum">=</button><span id="result"></span>
<script>
const a=document.querySelector('#a'),b=document.querySelector('#b'),r=document.querySelector('#result');
document.querySelector('#sum').addEventListener('click',()=>{r.textContent=String(Number(a.value)+Number(b.value));});
</script></body></html>`,
  'style.css': '',
};

const results = [];
const record = (name, ok, detail, fix) =>
  results.push({ name, ok, detail, fix });

const docker = (args) =>
  execFileSync('docker', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const psql = (q) =>
  docker([
    'exec',
    PG_CONTAINER,
    'psql',
    '-U',
    'quanta',
    '-d',
    'quanta_db',
    '-t',
    '-A',
    '-c',
    q,
  ]);

async function check(name, fn, fix) {
  try {
    const detail = await fn();
    record(name, true, detail, fix);
    console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ''}`);
    return true;
  } catch (e) {
    const msg = e?.message?.split('\n')[0] ?? String(e);
    record(name, false, msg, fix);
    console.log(`  ❌ ${name} — ${msg}`);
    if (fix) console.log(`     修复: ${fix}`);
    return false;
  }
}

async function get(pathname) {
  const r = await fetch(WEB + pathname, { redirect: 'manual' });
  return r.status;
}

// ---------------------------------------------------------------- 开始
console.log('=== Quanta 平台冒烟测试 ===\n');

console.log('[1/6] Docker 依赖容器');
const dockerOk = await check(
  'Docker 守护进程可访问',
  () => {
    docker(['ps', '--format', '{{.Names}}']);
    return 'OK';
  },
  '启动 Docker Desktop 后重试',
);
if (dockerOk) {
  await check(
    'PostgreSQL 容器运行中',
    () => {
      const out = docker(['inspect', PG_CONTAINER, '--format', '{{.State.Status}}']);
      if (out !== 'running') throw new Error(`状态=${out}`);
      return out;
    },
    `docker start ${PG_CONTAINER}`,
  );
  await check(
    'Redis 容器运行中',
    () => {
      const out = docker(['inspect', REDIS_CONTAINER, '--format', '{{.State.Status}}']);
      if (out !== 'running') throw new Error(`状态=${out}`);
      return out;
    },
    `docker start ${REDIS_CONTAINER}`,
  );
  await check(
    'PostgreSQL 可接受连接',
    () => {
      const out = docker(['exec', PG_CONTAINER, 'pg_isready', '-U', 'quanta']);
      return out;
    },
    `docker start ${PG_CONTAINER}`,
  );
}

console.log('\n[2/6] 应用服务端口');
await check(
  'Web 应用 (:3000)',
  async () => {
    const s = await get('/auth/login');
    if (s !== 200) throw new Error(`HTTP ${s}`);
    return `HTTP ${s}`;
  },
  'cd packages/challenge-web-app && pnpm dev:watch',
);
const schedulerOk = await check(
  '评测调度器 (:1888)',
  async () => {
    const r = await fetch(`${SCHEDULER}/health`);
    const j = await r.json();
    if (j.status !== 'ok') throw new Error(JSON.stringify(j));
    return 'health ok';
  },
  'cd packages/challenge-judge-scheduler && pnpm dev',
);

console.log('\n[3/6] 判题机容器');
if (schedulerOk) {
  await check(
    '判题机容器运行中',
    () => {
      const out = docker(['ps', '--format', '{{.Image}}|{{.Status}}']);
      const line = out.split('\n').find((l) => l.includes('challenge-judge-machine-agent'));
      if (!line) throw new Error('未找到判题机容器（调度器启动时会自动创建）');
      return line.split('|')[1];
    },
    '重启调度器以自动创建判题机容器',
  );
} else {
  record('判题机容器运行中', false, '调度器未就绪，跳过', null);
  console.log('  ⏭  调度器未就绪，跳过');
}

console.log('\n[4/6] 跨源隔离（在线编辑器依赖）');
// 注意：必须先登录再请求 /challenge/**。未登录时会被 302 到 /auth/login，
// 而登录页本就不下发 COOP/COEP（不需要跨源隔离），会误判为失败。
await check(
  '/challenge/** 下发 COOP/COEP（已登录）',
  async () => {
    const login = await fetch(`${WEB}/api/trpc/auth.login.email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ssr': '1' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (!login.ok) throw new Error(`登录失败 HTTP ${login.status}`);
    const cookies = (login.headers.getSetCookie?.() ?? [])
      .map((c) => c.split(';')[0])
      .join('; ');

    const r = await fetch(`${WEB}/challenge/editor/${PROBLEM_ID}`, {
      headers: { Cookie: cookies },
      redirect: 'manual',
    });
    if (r.status !== 200) {
      throw new Error(`HTTP ${r.status}（携带会话后仍非 200）`);
    }
    const coep = r.headers.get('cross-origin-embedder-policy');
    const coop = r.headers.get('cross-origin-opener-policy');
    if (coop !== 'same-origin') throw new Error(`COOP=${coop}（应为 same-origin）`);
    if (coep !== 'require-corp') throw new Error(`COEP=${coep}（应为 require-corp）`);
    return `HTTP 200 COOP=${coop} COEP=${coep}`;
  },
  '检查 nuxt.config.ts 的 routeRules["/challenge/**"].security.headers',
);

console.log('\n[5/6] 端到端判题');
if (schedulerOk) {
  await check(
    '登录 → 提交 → 出判题结果',
    async () => {
      const login = await fetch(`${WEB}/api/trpc/auth.login.email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ssr': '1' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });
      if (!login.ok) throw new Error(`登录失败 HTTP ${login.status}`);
      const cookies = (login.headers.getSetCookie?.() ?? [])
        .map((c) => c.split(';')[0])
        .join('; ');

      const snapshot = {};
      for (const [k, v] of Object.entries(ANSWER)) snapshot[`/project/${k}`] = v;

      const t0 = Date.now();
      const res = await fetch(`${WEB}/api/trpc/protected.problem.commitAnswer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ssr': '1',
          Cookie: cookies,
        },
        body: JSON.stringify({ problemId: PROBLEM_ID, snapshot }),
      });
      const rid = (await res.json())?.result?.data?.judgeRecordId;
      if (!rid) throw new Error('未拿到 judgeRecordId');

      for (let i = 0; i < 40; i++) {
        const row = pgFailSoft(
          `select result || '|' || score from judge_records where id=${rid}`,
        );
        const [result, score] = row.split('|');
        if (result && result !== 'pending') {
          if (result !== 'success') {
            throw new Error(`判题结果=${result} score=${score}（期望 success）`);
          }
          return `id=${rid} ${result} ${score} 分 / ${Date.now() - t0}ms`;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      throw new Error('60 秒内未出结果（判题机未响应）');
    },
    '查看调度器日志；确认判题机容器与新镜像一致',
  );
} else {
  console.log('  ⏭  调度器未就绪，跳过');
}

console.log('\n[6/6] 运行环境');
// 说明：曾误判 webcontainer.static.stackblitz.com 被阻断——该主机名在公共 DNS 上
// 是 NXDOMAIN，并非当前版本使用的主机。真实入口是 stackblitz.com（boot 的 iframe）。
//
// 实测该域名可达性**不稳定**：有时 1.2~1.9s 正常返回，有时 20s 超时；
// 而其它境外站点（unpkg / jsdelivr / npm registry / static.stackblitz.io）始终正常。
// 因此这里只做"当前是否可达"的报告，并把超时视为**可能影响编辑器**的警告，
// 不作为平台不可用的判定——登录、题库、判题与它无关。
await check(
  'stackblitz.com 当前可达（WebContainer 入口）',
  async () => {
    const r = await fetch('https://stackblitz.com/', {
      redirect: 'manual',
      signal: AbortSignal.timeout(20000),
    });
    return `HTTP ${r.status}`;
  },
  '仅影响在线编辑器的实时预览；登录/题库/判题不受影响。若需要编辑器，请稍后重试或检查网络对该域名的可达性',
);

// ---------------------------------------------------------------- 汇总
const failed = results.filter((r) => !r.ok);
console.log('\n' + '='.repeat(52));
if (failed.length === 0) {
  console.log('✅ 全部通过：平台可正常使用');
  console.log(`   Web: ${WEB}   账号: ${ADMIN_EMAIL}`);
} else {
  console.log(`❌ ${failed.length} 项未通过：`);
  for (const f of failed) {
    console.log(`   - ${f.name}: ${f.detail}`);
    if (f.fix) console.log(`     → ${f.fix}`);
  }
  console.log(
    '\n提示：WebContainer 一项失败只影响"在线编辑器实时预览"，' +
      '不影响登录、题库与判题。',
  );
}
console.log('='.repeat(52));
process.exit(failed.length === 0 ? 0 : 1);

function pgFailSoft(q) {
  try {
    return psql(q);
  } catch {
    return '';
  }
}
