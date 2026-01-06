/*
  Warnings:

  - You are about to drop the column `achievementDataLoaderId` on the `achievement_dependency_data` table. All the data in the column will be lost.
  - You are about to drop the `achievement_data_loaders` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[achievementId,achievementDepDataLoaderId]` on the table `achievement_dependency_data` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `achievementDepDataLoaderId` to the `achievement_dependency_data` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AchievementDepDataType" AS ENUM ('NUMERIC', 'BOOLEAN', 'TEXT');

-- DropForeignKey
ALTER TABLE "achievement_dependency_data" DROP CONSTRAINT "achievement_dependency_data_achievementDataLoaderId_fkey";

-- DropIndex
DROP INDEX "achievement_dependency_data_achievementId_achievementDataLo_key";

-- AlterTable
ALTER TABLE "achievement_dependency_data" DROP COLUMN "achievementDataLoaderId",
ADD COLUMN     "achievementDepDataLoaderId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "achievement_data_loaders";

-- DropEnum
DROP TYPE "AchievementDataType";

-- CreateTable
CREATE TABLE "achievement_dep_data_loaders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sql" TEXT NOT NULL,
    "type" "AchievementDepDataType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_dep_data_loaders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_dependency_data_achievementId_achievementDepDat_key" ON "achievement_dependency_data"("achievementId", "achievementDepDataLoaderId");

-- AddForeignKey
ALTER TABLE "achievement_dependency_data" ADD CONSTRAINT "achievement_dependency_data_achievementDepDataLoaderId_fkey" FOREIGN KEY ("achievementDepDataLoaderId") REFERENCES "achievement_dep_data_loaders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
