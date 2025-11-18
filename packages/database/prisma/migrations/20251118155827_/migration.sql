-- CreateTable
CREATE TABLE "user_space_configs" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "showSubmissionStatus" BOOLEAN NOT NULL DEFAULT true,
    "showAchievements" BOOLEAN NOT NULL DEFAULT true,
    "personalInfoVisibility" JSONB NOT NULL DEFAULT '{"birthday":true,"email":true,"identifier":true,"major":true}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_space_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_space_configs_userId_key" ON "user_space_configs"("userId");

-- AddForeignKey
ALTER TABLE "user_space_configs" ADD CONSTRAINT "user_space_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
