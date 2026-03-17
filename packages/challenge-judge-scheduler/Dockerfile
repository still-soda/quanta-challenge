FROM node:24-slim

# 声明代理参数
ARG http_proxy
ARG https_proxy
ENV HTTP_PROXY=${http_proxy}
ENV HTTPS_PROXY=${https_proxy}

WORKDIR /app

# 安装 openssl
RUN apt-get update && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制所有包的 package.json
COPY packages/challenge-judge-scheduler/package.json ./packages/scheduler/package.json
COPY packages/challenge-agents/judge-machine/package.json ./packages/judge-machine/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# 安装 pnpm
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install pnpm -g --verbose

# 安装依赖
RUN pnpm install

# 复制源代码
COPY packages/challenge-judge-scheduler ./packages/scheduler
COPY packages/challenge-agents/judge-machine ./packages/judge-machine
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# 生成 Prisma 客户端
WORKDIR /app/packages/database
RUN pnpm add prisma --save-dev
RUN pnpm add @prisma/client --save
RUN pnpm prisma:generate

# 构建项目
WORKDIR /app/packages/scheduler
RUN pnpm add @challenge/judge-machine-agent --workspace
RUN pnpm build

# 迁移数据库 -> 启动服务
CMD ["sh", "-c", "cd ../database && pnpm run prisma:migrate:deploy && cd ../scheduler && pnpm run start"]
# CMD ["sh", "-c", "pnpm run start"]