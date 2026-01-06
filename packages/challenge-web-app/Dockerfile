FROM node:24-slim
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制所有包的 package.json
COPY packages/challenge-web-app/package.json ./packages/web/package.json
COPY packages/challenge-agents/judge-machine/package.json ./packages/judge-machine/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# 安装 pnpm
RUN npm config set registry https://registry.npmmirror.com
RUN npm install pnpm -g --verbose

# 安装依赖
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
CMD ["node", ".output/server/index.mjs"]