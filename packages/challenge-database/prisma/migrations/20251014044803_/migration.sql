/*
  Warnings:

  - You are about to drop the column `dailyProblemId` on the `base_problems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "base_problems" DROP CONSTRAINT "base_problems_dailyProblemId_fkey";

-- AlterTable
ALTER TABLE "base_problems" DROP COLUMN "dailyProblemId";

-- AddForeignKey
ALTER TABLE "daily_problems" ADD CONSTRAINT "daily_problems_baseProblemId_fkey" FOREIGN KEY ("baseProblemId") REFERENCES "base_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
