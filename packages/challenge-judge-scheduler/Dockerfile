FROM node:24-slim

# 声明代理参数
ARG http_proxy
ARG https_proxy
ENV HTTP_PROXY=${http_proxy}
ENV HTTPS_PROXY=${https_proxy}

# 镜像源可覆盖，默认走官方源
ARG APT_MIRROR=""
ARG NPM_REGISTRY="https://registry.npmjs.org/"

WORKDIR /app

# 调度器源码只在 NODE_ENV=production 时启动 HTTP 监听
ENV NODE_ENV=production

# 安装 openssl 与 node-gyp 所需的编译工具链（ssh2 需要）
RUN if [ -n "$APT_MIRROR" ]; then \
       sed -i "s/deb.debian.org/$APT_MIRROR/g" /etc/apt/sources.list.d/debian.sources; \
    fi && \
    apt-get update && apt-get install -y openssl libssl3 python3 make g++ && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制所有包的 package.json
COPY packages/challenge-judge-scheduler/package.json ./packages/scheduler/package.json
COPY packages/challenge-agents/judge-machine/package.json ./packages/judge-machine/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# 安装 pnpm (固定 v9 版本，避免 v10 默认忽略构建脚本导致安装失败)
RUN npm config set registry ${NPM_REGISTRY}
RUN npm install pnpm@9.15.9 -g --verbose

# 安装依赖（严格遵循 pnpm-lock.yaml）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY packages/challenge-judge-scheduler ./packages/scheduler
COPY packages/challenge-agents/judge-machine ./packages/judge-machine
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# 生成 Prisma 客户端
WORKDIR /app/packages/database
RUN pnpm prisma:generate

# 构建项目
WORKDIR /app/packages/scheduler
RUN pnpm build

# 迁移数据库 -> 启动服务
CMD ["sh", "-c", "cd ../database && pnpm run prisma:migrate:deploy && cd ../scheduler && pnpm run start"]
