/*
  Warnings:

  - You are about to drop the `_AchievementToAchievementDataLoader` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AchievementToAchievementDataLoader" DROP CONSTRAINT "_AchievementToAchievementDataLoader_A_fkey";

-- DropForeignKey
ALTER TABLE "_AchievementToAchievementDataLoader" DROP CONSTRAINT "_AchievementToAchievementDataLoader_B_fkey";

-- AlterTable
ALTER TABLE "achievement_data_loaders" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "_AchievementToAchievementDataLoader";

-- CreateTable
CREATE TABLE "achievement_dependency_data" (
    "id" SERIAL NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "achievementDataLoaderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_dependency_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_validate_scripts" (
    "id" SERIAL NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "script" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_validate_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_dependency_data_achievementId_achievementDataLo_key" ON "achievement_dependency_data"("achievementId", "achievementDataLoaderId");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_validate_scripts_achievementId_key" ON "achievement_validate_scripts"("achievementId");

-- AddForeignKey
ALTER TABLE "achievement_dependency_data" ADD CONSTRAINT "achievement_dependency_data_achievementDataLoaderId_fkey" FOREIGN KEY ("achievementDataLoaderId") REFERENCES "achievement_data_loaders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_dependency_data" ADD CONSTRAINT "achievement_dependency_data_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_validate_scripts" ADD CONSTRAINT "achievement_validate_scripts_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
