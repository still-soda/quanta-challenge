# 部署交接说明（给服务器上的 agent）

> 本文只讲**部署这个仓库当前状态**需要知道的事，不涉及改代码。
> 所有结论都在开发环境实测过，标注了「已验证」与「未验证」。

---

## 〇、先确认一件事：web 镜像当前构建不出来

**不要直接 `docker compose up -d` 去构建全套**，`challenge-web-app` 镜像会失败：

```
Nuxt Build Error: [vite]: Rollup failed to resolve import "#components"
```

原因：仓库里有 11 个文件 `import ... from '#components'`（Nuxt 虚拟模块），
在容器构建环境下解析不稳定。**这是已知未解决问题。**

因此有两种部署形态，先跟需求方确认走哪种：

| 形态 | web 应用 | 调度器 + 判题机 | 状态 |
|---|---|---|---|
| **A** | 宿主机跑 `pnpm dev` 或 `pnpm build && node .output/server/index.mjs` | 容器 | 平台功能已全部实测可用 |
| **B** | 容器（一键 compose） | 容器 | **当前不可行**，需先修 `#components` |

下文按**形态 A** 写。

---

## 一、硬前置（不满足就一定失败）

### 1. 六个环境变量，缺一不可

在 `docker/` 下创建 `.env`：

```bash
# ---- compose 会强校验，缺失直接报错退出 ----
APP_SERVER=https://你的域名                # 必须是外部可访问地址；用于 cookie 与静态资源 URL
SUPER_ADMIN_ACCOUNT=<管理员账号>
SUPER_ADMIN_PASSWORD=<强口令>
OPENAPI_WEBHOOK_SECRET=<随机长串>

# ---- compose 不会校验，但缺了 web 容器会启动即崩 ----
ACCESS_TOKEN_SECRET=<随机长串>
REFRESH_TOKEN_SECRET=<随机长串>

# 可选
SUPER_ADMIN_EMAIL=<管理员邮箱>
```

**为什么后两个也必须给**：web 镜像运行期是 `NODE_ENV=production`，
而 `nuxt.config.ts` 里这两个密钥在 production 下**强制要求**（缺失直接抛错终止启动）。
这是刻意设计 —— 内置默认值写在源码里，等于公开的签名密钥。
`docker/docker-compose.yaml` 的 `challenge-web-app` 服务**没有传这两个变量**，必须由 `.env` 提供。

**⚠️ `OPENAPI_WEBHOOK_SECRET` 必须与调度器侧完全一致**：调度器用它签名，
web 用它验签。不一致时 web 端中间件返回 403，**表现是"判题成功但分数/排名/通知都不更新"**，
非常难发现。

### 2. 两个判题镜像必须先构建

`challenge-judge-machine-agent` 与 `challenge-live-server-agent` 在 compose 里带
`profiles: [ignore]`，**compose 不会构建它们**；而调度器启动时会去拉起
`challenge-judge-machine-agent`，镜像不存在则初始化失败、所有判题卡在 pending。

```bash
pnpm install
pnpm --filter @challenge/judge-machine-agent docker:build
pnpm --filter @challenge/live-server-agent docker:build
```

judge-machine 镜像约 6GB，构建较慢（要装 Chromium 及其系统依赖）。
若 apt 源不通，Dockerfile 支持 `--build-arg APT_MIRROR=mirrors.aliyun.com`。

### 3. Docker socket

调度器在容器内、需要创建**兄弟容器**，因此 `docker-compose.yaml` 挂了
`/var/run/docker.sock` —— 宿主机 Docker 守护进程必须在跑（**已验证可用**）。

---

## 二、启动

### 形态 A：web 在宿主机，调度器 + 判题在容器

```bash
# 1) 起依赖与调度器（不含 web）
docker compose -f docker/docker-compose.yaml up -d postgres redis challenge-judge-scheduler

# 2) web 应用在宿主机（二选一）
pnpm --filter @challenge/app dev                      # 开发式，最快可用
# 或
pnpm --filter @challenge/app build && node packages/challenge-web-app/.output/server/index.mjs
```

⚠️ **`pnpm build` 在开发机（Windows）上从未成功过**（卡在 esbuild 临时文件
`Access is denied`，属 Windows 文件锁问题）。**在 Linux 服务器上大概率正常，但未经验证。**
建议先跑 `pnpm build` 验证；失败就先退回 `pnpm dev` 顶上，不要在这上面耗太久。

⚠️ **不要在 web 应用运行时执行 `pnpm typecheck` 或 `nuxt build`**：
它们会重写 `.nuxt/` 目录，把正在运行的 dev server 的产物清掉，
之后所有请求返回 `500 Cannot find module '.nuxt/dist/server/client.manifest.mjs'`。
必须先停服务再造构建。

### 形态 B：一键 compose（**当前不可行**）

前置：修复 `#components` 问题后，
```bash
docker compose -f docker/docker-compose.yaml up -d
```

---

## 三、红线（这几条踩了就出事）

| # | 红线 | 原因 |
|---|---|---|
| 1 | **不要改 `LOCAL_STORE_PATH` 为相对路径** | 判题封面由调度器写、由 web 读。相对路径按各自 cwd 解析会变成两个目录 → **所有题目封面 404**。该值若为相对路径会被代码忽略并告警，强制收敛到规范目录；要用就配**绝对路径** |
| 2 | **不要动 `TEMP_DIR` / `/app/tmp` 的共享挂载** | 判题快照目录会作为 bind mount 的 Source 交给**宿主机** Docker daemon 解析。容器私有路径宿主机不存在 → `bind source path does not exist`，判题全部失败 |
| 3 | **改了判题机代码必须重建镜像 + 删除旧容器** | 调度器启动时会**复用**已存在的判题机容器。镜像重建了但容器没换，跑的还是旧代码 —— 实测因此出现过"代码修好了但行为没变" |
| 4 | **判题机长跑会劣化** | 实测运行约 11 小时后开始 `Judge Machine response timeout`。**删除判题机容器让调度器重建即可恢复**。生产环境建议加定期重启（每 6–12 小时） |
| 5 | **不要用 `taskkill /IM node.exe`** | 会杀掉宿主机上无关的 node 进程。按端口精确杀 |
| 6 | **清理测试数据时不要无条件删判题记录** | `template_judge_records` 关联到审计记录且级联删除。删掉后该题所有 `judge` 提交都会失败：`templateJudgeRecords.findFirstOrThrow`。若需清理：`delete from judge_records where id > N and id not in (select "judgeRecordId" from template_judge_records)` |

---

## 四、部署后验证（照顺序做，每步都有明确预期）

```bash
# 1) 容器与端口
docker compose -f docker/docker-compose.yaml ps
#    预期：postgres / redis / challenge-judge-scheduler 均为 Up
#    预期：judge-machine 容器也被调度器自动创建（约 1 分钟内出现）

curl -s http://localhost:1888/health
#    预期：{"status":"ok"}  ← 若返回 ok 但判题机容器不存在，说明初始化没走完，看调度器日志

# 2) 调度器日志里必须出现这几行
docker compose logs challenge-judge-scheduler | tail -30
#    预期：[INFO] Judge machine container started: <id>
#    预期：[INFO] Live-server sweeper started (every 30s, grace 300s)
#    预期：服务依赖初始化完成
#    预期：Server is running on http://localhost:1888

# 3) 平台自检（web 起来之后跑）
pnpm smoke
#    预期：6 项里至少 5 项 ✅
#    唯一允许失败的是 "stackblitz.com 当前可达"（在线编辑器依赖的外部 CDN，
#    与登录/题库/判题无关）

# 4) 逐项人工确认
#    · 题库能打开、6 道题封面**都能正常显示图片**（不是 "Cover Image" 文字）
#    · 登录一个普通账号能进 dashboard
#    · 提交任意一题的正确答案，能出分数（不是 pending/空白）
```

**封面裂开时的排查顺序**（最常见的故障）：

```bash
# a) DB 里记的封面文件名
docker compose exec postgres psql -U quanta -d quanta_db -t -c \
  'select i.name from problem_default_covers pdc join images i on i.id = pdc."imageId";'
# b) 文件是否在 Web 读取的目录里（compose 下是 qtc_app_storage 卷的 /app/packages/web/local_store）
docker compose exec challenge-web-app ls /app/packages/web/local_store
# c) 直接请求 URL
curl -I http://localhost:3000/api/static/<上面的文件名>
# 404 且文件在别处 → 把文件复制到 web 的 local_store，不要只改数据库（文件才是真相）
```

---

## 五、目前**未验证**的部分（请务必知道）

1. **web 应用的容器镜像**：构建失败，从未成功过
2. **web 的生产构建（`nuxt build`）**：开发机上从未成功过一次（Windows 特有文件锁；
   Linux 上大概率可行但**未验证**）
3. **生产模式下的 web 运行**：所有验证都在 dev 模式完成
4. **多用户并发**：压测是单客户端打并发，未做真实多账号并发
5. **数据库连接上限**：默认 `max_connections=100`，压测峰值用过 45，未调优

---

## 六、参考数据（容量与性能，均实测）

| 项 | 数值 |
|---|---|
| web 层吞吐 | 约 700 req/s |
| 判题吞吐 | 约 1.65 次/秒（≈5900 次/小时） |
| 单次判题耗时 | 约 1.7 秒 |
| 整机稳态内存 | 约 1.4–1.6 GiB |
| 建议服务器 | **4 vCPU / 8 GB / 80–100 GB SSD** |
| 镜像占用 | judge-machine 约 6 GB、scheduler 约 1.5 GB、live-server 约 385 MB |

更多细节见 `DEPLOY_SIZING.md`（容量测算）与 `QUALITY_BASELINE.md`（质量基线）。
出题相关的坑位见 `docs/PROBLEM_AUTHORING.md`。
