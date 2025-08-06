/*
  Warnings:

  - You are about to drop the `TemplateJudgeRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TemplateJudgeRecord" DROP CONSTRAINT "TemplateJudgeRecord_judgeRecordId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateJudgeRecord" DROP CONSTRAINT "TemplateJudgeRecord_problemId_fkey";

-- DropTable
DROP TABLE "TemplateJudgeRecord";

-- CreateTable
CREATE TABLE "template_judge_records" (
    "id" SERIAL NOT NULL,
    "judgeRecordId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_judge_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "template_judge_records" ADD CONSTRAINT "template_judge_records_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_judge_records" ADD CONSTRAINT "template_judge_records_judgeRecordId_fkey" FOREIGN KEY ("judgeRecordId") REFERENCES "judge_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
