FROM node:slim

WORKDIR /app

# install dependencies
RUN npm install -g live-server

# 注意：调度器把用户代码快照挂载到 /app，而快照内部保留了一层 project/ 目录
# （真实页面位于 /app/project/index.html）。若以 /app 作为站点根目录，live-server
# 找不到 index.html 会返回 404，判题脚本的 waitForSelector 将一直等待，
# 最终表现为 "Judge Machine response timeout"（前端只显示空白判题详情）。
# 因此必须显式把 project 子目录作为站点根目录。
CMD ["live-server", "project", "--port=3000", "--host=0.0.0.0", "--no-browser"]

# expose the port
EXPOSE 3000