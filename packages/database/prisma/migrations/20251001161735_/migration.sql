/*
  Warnings:

  - You are about to drop the column `problemId` on the `daily_problems` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[baseProblemId]` on the table `daily_problems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseProblemId` to the `daily_problems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "daily_problems" DROP CONSTRAINT "daily_problems_problemId_fkey";

-- DropIndex
DROP INDEX "daily_problems_problemId_key";

-- AlterTable
ALTER TABLE "daily_problems" DROP COLUMN "problemId",
ADD COLUMN     "baseProblemId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "daily_problems_baseProblemId_key" ON "daily_problems"("baseProblemId");

-- AddForeignKey
ALTER TABLE "daily_problems" ADD CONSTRAINT "daily_problems_baseProblemId_fkey" FOREIGN KEY ("baseProblemId") REFERENCES "base_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
