FROM mcr.microsoft.com/playwright:v1.54.1-jammy

# COPY local files exclude node_modules and .git
COPY . /app

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm install 
RUN pnpm run build

CMD [ "pnpm", "start" ]

EXPOSE 3000