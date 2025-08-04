-- CreateTable
CREATE TABLE "TemplateJudgeRecord" (
    "id" SERIAL NOT NULL,
    "judgeRecordId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateJudgeRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemplateJudgeRecord" ADD CONSTRAINT "TemplateJudgeRecord_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateJudgeRecord" ADD CONSTRAINT "TemplateJudgeRecord_judgeRecordId_fkey" FOREIGN KEY ("judgeRecordId") REFERENCES "judge_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
