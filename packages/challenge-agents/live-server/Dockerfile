FROM node:slim

WORKDIR /app

# install dependencies
RUN npm install -g live-server

# run live-server
CMD ["live-server", "--port=3000", "--host=0.0.0.0", "--no-browser"]

# expose the port
EXPOSE 3000