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
COPY packages/challenge-web-app/package.json ./packages/web/package.json
COPY packages/challenge-agents/judge-machine/package.json ./packages/judge-machine/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# 安装 pnpm
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install pnpm -g --verbose

# 安装依赖，并强制安装 Nuxt 4
RUN pnpm install

# 复制源代码
COPY packages/challenge-web-app ./packages/web
COPY packages/challenge-agents/judge-machine ./packages/judge-machine
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# 构建应用
WORKDIR /app/packages/web
RUN pnpm remove nuxt && pnpm add nuxt@^4.0.0
RUN pnpm build

# 生成 Prisma 客户端
WORKDIR /app/packages/database
RUN pnpm prisma:generate

# 运行数据库迁移和种子脚本，然后启动应用
WORKDIR /app/packages/web
CMD ["sh", "-c", "node scripts/prisma-seed.ts && node .output/server/index.mjs"]