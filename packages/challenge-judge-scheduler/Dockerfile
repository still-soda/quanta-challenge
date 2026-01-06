FROM node:24-slim
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制所有包的 package.json
COPY packages/challenge-judge-scheduler/package.json ./packages/scheduler/package.json
COPY packages/challenge-agents/judge-machine/package.json ./packages/judge-machine/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# 安装 pnpm
RUN npm config set registry https://registry.npmmirror.com
RUN npm install pnpm -g --verbose

# 安装依赖
RUN pnpm install

# 复制源代码
COPY packages/challenge-judge-scheduler ./packages/scheduler
COPY packages/challenge-agents/judge-machine ./packages/judge-machine
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# 迁移数据库 -> 启动服务
WORKDIR /app/packages/scheduler
CMD ["sh", "-c", "cd ../database && pnpm run prisma:migrate:deploy && cd ../scheduler && pnpm run prod"]