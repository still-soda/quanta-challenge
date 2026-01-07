# Judge Scheduler

**Judge Scheduler** 是 Quanta 前端挑战平台的评测调度服务，负责管理评测任务队列、调度 Docker 容器、以及协调评测机与数据库之间的通信。

## 目录

- [概述](#概述)
- [核心功能](#核心功能)
- [开发指南](#开发指南)
- [Docker 部署](#docker-部署)
- [API 参考](#api-参考)
- [环境变量](#环境变量)

## 概述

Judge Scheduler 是评测系统的核心调度层，接收来自 Web 应用的评测请求，将其放入 BullMQ 任务队列，并协调 Docker 容器的生命周期管理。它通过 WebSocket 与 Judge Machine 保持长连接，实时转发评测任务和接收结果。

### 主要职责

- 接收和验证评测任务请求
- 管理 BullMQ 任务队列
- 创建和销毁 Live Server 容器
- 维护与 Judge Machine 的 WebSocket 连接
- 处理评测结果并更新数据库
- 管理临时文件和评测产物

### 数据流

1. Web 应用提交评测任务到 `/task/judge` 端点
2. 任务被加入 BullMQ 队列等待处理
3. Worker 从队列取出任务，创建 Live Server 容器
4. 通过 WebSocket 将任务发送给 Judge Machine
5. Judge Machine 执行评测并返回结果
6. 处理结果，更新数据库，清理容器资源

## 核心功能

### 1. 任务队列管理

基于 BullMQ 实现的分布式任务队列：

- **并发控制**: 默认 3 个 Worker 并发处理
- **任务优先级**: 支持任务优先级排序
- **失败重试**: 自动重试失败的评测任务
- **超时处理**: 30 秒评测超时自动终止

### 2. Docker 容器管理

- **网络管理**: 创建和维护 `orange-network` Docker 网络
- **Live Server**: 为每个评测任务创建独立容器运行用户代码
- **Judge Machine**: 管理 Playwright 评测容器的生命周期
- **资源清理**: 评测完成后自动清理容器和临时文件

### 3. WebSocket 通信

- **长连接维护**: 与 Judge Machine 保持持久 WebSocket 连接
- **JRTP 协议解析**: 解析 Judge Machine 返回的二进制评测结果
- **事件驱动**: 基于 EventEmitter 的异步事件处理

### 4. 文件系统服务

- **快照恢复**: 将用户代码快照恢复为文件系统
- **临时文件管理**: 管理评测产生的临时文件
- **评测产物存储**: 保存截图、缓存文件等评测产物

## 开发指南

### 前置条件

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker >= 24.0.0
- Redis >= 7.0
- PostgreSQL >= 16.0

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（热重载）
pnpm dev

# 构建生产版本
pnpm build

# 运行生产版本
pnpm start
```

### 项目结构

```
challenge-judge-scheduler/
├── src/
│   ├── index.ts                 # 应用入口
│   ├── controllers/             # HTTP 控制器
│   │   ├── index.ts             # Hono 应用配置
│   │   ├── task.ts              # 评测任务控制器
│   │   └── code.ts              # 代码编译控制器
│   ├── events/                  # 事件类型定义
│   │   └── index.ts
│   ├── filters/                 # 异常过滤器
│   │   └── gloabl-expection-filter.ts
│   ├── middlewares/             # 中间件
│   │   └── env.ts               # 环境变量加载
│   ├── mq/                      # 消息队列
│   │   ├── index.ts             # 队列初始化
│   │   ├── result-handler.ts    # 结果处理器
│   │   └── judge-processor/     # 评测处理器
│   │       ├── index.ts         # 处理器入口
│   │       ├── db.ts            # 数据库操作
│   │       └── types.ts         # 类型定义
│   ├── schemas/                 # Zod 数据模式
│   │   ├── create-task.ts       # 任务创建模式
│   │   ├── compile.ts           # 编译请求模式
│   │   └── job.ts               # 队列任务模式
│   ├── services/                # 业务服务
│   │   ├── index.ts             # 服务初始化
│   │   ├── docker.ts            # Docker 服务
│   │   ├── queue.ts             # 队列服务
│   │   ├── redis.ts             # Redis 服务
│   │   ├── compile.ts           # 编译服务
│   │   └── temp-file.ts         # 临时文件服务
│   └── utils/                   # 工具函数
│       ├── event-emitter.ts     # 事件发射器
│       ├── local-store.ts       # 本地存储
│       ├── prisma.ts            # Prisma 客户端
│       ├── singleton.ts         # 单例模式
│       └── validator.ts         # 数据验证
├── tmp/                         # 临时文件目录
├── Dockerfile                   # Docker 构建文件
├── vite.config.ts               # Vite 配置
├── package.json
└── tsconfig.json
```

### 核心服务类

#### DockerService

管理 Docker 容器和网络：

```typescript
class DockerService {
  // 初始化 Docker 网络和 Judge Machine 容器
  async init(): Promise<void>;

  // 启动 Live Server 容器
  async startLiveServerContainer(
    fsSnapshot: Record<string, string>
  ): Promise<{ networkUrl: string; stop: () => Promise<void> }>;

  // 启动 Playwright 容器
  async startPlaywrightContainer(): Promise<{
    ws: WebSocket;
    container: Docker.Container;
    containerId: string;
  }>;
}
```

#### QueueService

管理 BullMQ 任务队列：

```typescript
class QueueService {
  // 初始化队列和 Worker
  async init(): Promise<void>;

  // 添加评测任务
  async addJudgeJob(data: JobData): Promise<Job>;

  // 关闭队列
  async close(): Promise<void>;
}
```

## Docker 部署

### 构建镜像

```bash
# 标准构建
pnpm docker:build

# 使用代理构建
pnpm docker:build:proxy
```

### 镜像信息

- **镜像名称**: `challenge-judge-scheduler`
- **基础镜像**: `node:20-alpine`
- **暴露端口**: 1888（生产）/ 3000（开发）
- **工作目录**: `/app`

### 运行要求

容器需要挂载 Docker Socket 以管理其他容器：

```bash
docker run -d \
  --name judge-scheduler \
  --network quanta-challenge-network \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e DATABASE_URL=postgres://user:pass@host:5432/db \
  -e REDIS_HOST=redis \
  challenge-judge-scheduler
```

## API 参考

### HTTP 端点

#### 评测任务

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/task/judge` | 提交评测任务 |
| GET | `/task/status/:id` | 查询任务状态 |

#### 代码编译

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/code/compile` | 编译用户代码 |

### 请求/响应格式

#### 提交评测任务

**请求:**

```typescript
POST /task/judge
Content-Type: application/json

{
  "judgeRecordId": "string",    // 评测记录 ID
  "problemId": number,           // 题目 ID
  "fsSnapshot": Record<string, string>,  // 文件系统快照
  "judgeScript": "string",       // 评测脚本
  "mode": "audit" | "judge"      // 评测模式
}
```

**响应:**

```typescript
{
  "success": true,
  "jobId": "string"
}
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | - |
| `REDIS_HOST` | Redis 主机地址 | `localhost` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | Redis 密码 | - |
| `PORT` | 服务监听端口 | `1888` |
| `NODE_ENV` | 运行环境 | `development` |

## 评测模式

### Audit 模式

用于题目模板验证：

- 生成首屏截图作为标准答案
- 缓存测试点结果供后续比对
- 验证评测脚本的正确性

### Judge 模式

用于用户提交评测：

- 加载已缓存的标准答案
- 与用户提交进行比对
- 计算得分并记录结果

---

<p align="center">
  <b>Judge Scheduler</b> - Quanta 前端挑战评测调度中心
</p>
