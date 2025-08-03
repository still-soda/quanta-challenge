/*
  Warnings:

  - You are about to drop the column `problemId` on the `shadow_files` table. All the data in the column will be lost.
  - Added the required column `judgeRecordId` to the `shadow_files` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JudgeResult" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "JudgeType" AS ENUM ('audit', 'judge');

-- DropForeignKey
ALTER TABLE "shadow_files" DROP CONSTRAINT "shadow_files_problemId_fkey";

-- AlterTable
ALTER TABLE "shadow_files" DROP COLUMN "problemId",
ADD COLUMN     "judgeRecordId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "judge_records" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "result" "JudgeResult" NOT NULL DEFAULT 'pending',
    "type" "JudgeType" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "pendingTime" INTEGER NOT NULL DEFAULT 0,
    "judgingTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "judge_records" ADD CONSTRAINT "judge_records_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_records" ADD CONSTRAINT "judge_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadow_files" ADD CONSTRAINT "shadow_files_judgeRecordId_fkey" FOREIGN KEY ("judgeRecordId") REFERENCES "judge_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
