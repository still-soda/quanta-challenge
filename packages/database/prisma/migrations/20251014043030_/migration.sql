-- DropForeignKey
ALTER TABLE "daily_problems" DROP CONSTRAINT "daily_problems_baseProblemId_fkey";

-- DropIndex
DROP INDEX "daily_problems_baseProblemId_key";

-- AlterTable
ALTER TABLE "base_problems" ADD COLUMN     "dailyProblemId" INTEGER;

-- AddForeignKey
ALTER TABLE "base_problems" ADD CONSTRAINT "base_problems_dailyProblemId_fkey" FOREIGN KEY ("dailyProblemId") REFERENCES "daily_problems"("id") ON DELETE SET NULL ON UPDATE CASCADE;
