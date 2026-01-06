-- CreateEnum
CREATE TYPE "AchievementDataType" AS ENUM ('NUMERIC', 'BOOLEAN', 'TEXT');

-- CreateTable
CREATE TABLE "achievements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "badgeImageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_data_loaders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sql" TEXT NOT NULL,
    "type" "AchievementDataType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_data_loaders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AchievementToAchievementDataLoader" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AchievementToAchievementDataLoader_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "_AchievementToAchievementDataLoader_B_index" ON "_AchievementToAchievementDataLoader"("B");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_badgeImageId_fkey" FOREIGN KEY ("badgeImageId") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementToAchievementDataLoader" ADD CONSTRAINT "_AchievementToAchievementDataLoader_A_fkey" FOREIGN KEY ("A") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementToAchievementDataLoader" ADD CONSTRAINT "_AchievementToAchievementDataLoader_B_fkey" FOREIGN KEY ("B") REFERENCES "achievement_data_loaders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
