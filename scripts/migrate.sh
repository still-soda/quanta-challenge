# get current dir path
PROJECT_DIR=$(cd $(dirname $0)/..; pwd)

# navigate to project dir
cd $PROJECT_DIR

# install pnpm dependencies
echo "📦 Installing pnpm dependencies..."
pnpm install

# run database migrations
cd $PROJECT_DIR/packages/database
pnpm prisma:migrate:deploy

# check if has docker, if no, install it
if ! command -v docker &> /dev/null
then
    echo "🐳 Docker not found, installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl start docker
    systemctl enable docker
else
    echo "🐳 Docker found, skipping installation..."
fi

# build docker images
echo "🚀 Building Docker images..."

echo "[1/2] Building judge-machine image..."
cd $PROJECT_DIR/packages/docker/judge-machine
pnpm docker:build

echo "[2/2] Building live-server image..."
cd $PROJECT_DIR/packages/docker/live-server
pnpm docker:build

# build nuxt app
echo "🚀 Building Nuxt app..."
cd $PROJECT_DIR/packages/app
pnpm build

# start nuxt app server
echo "🚀 Starting Nuxt app server..."
cd $PROJECT_DIR/packages/app
pnpm prod &
APP_PID=$!
echo "✅ Nuxt app server started with PID [$APP_PID]"

# start judge server
echo "🚀 Starting judge server..."
cd $PROJECT_DIR/packages/judge
pnpm prod &
JUDGE_PID=$!
echo "✅ Judge server started with PID [$JUDGE_PID]"

# done
echo "🎉 Migration and setup completed successfully!"