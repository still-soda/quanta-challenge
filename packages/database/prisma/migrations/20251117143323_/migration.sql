/*
  Warnings:

  - You are about to drop the column `uploadJudgePath` on the `problems` table. All the data in the column will be lost.
  - Made the column `judgeUploadPath` on table `problems` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "problems" DROP COLUMN "uploadJudgePath",
ALTER COLUMN "judgeUploadPath" SET NOT NULL;
