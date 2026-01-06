-- DropForeignKey
ALTER TABLE "TemplateJudgeRecord" DROP CONSTRAINT "TemplateJudgeRecord_judgeRecordId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateJudgeRecord" DROP CONSTRAINT "TemplateJudgeRecord_problemId_fkey";

-- DropForeignKey
ALTER TABLE "audit_records" DROP CONSTRAINT "audit_records_problemId_fkey";

-- DropForeignKey
ALTER TABLE "judge_files" DROP CONSTRAINT "judge_files_problemId_fkey";

-- DropForeignKey
ALTER TABLE "judge_records" DROP CONSTRAINT "judge_records_problemId_fkey";

-- DropForeignKey
ALTER TABLE "problem_default_covers" DROP CONSTRAINT "problem_default_covers_problemId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_problemId_fkey";

-- DropForeignKey
ALTER TABLE "shadow_files" DROP CONSTRAINT "shadow_files_judgeRecordId_fkey";

-- DropForeignKey
ALTER TABLE "status_transitions" DROP CONSTRAINT "status_transitions_problemId_fkey";

-- AddForeignKey
ALTER TABLE "problem_default_covers" ADD CONSTRAINT "problem_default_covers_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_transitions" ADD CONSTRAINT "status_transitions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateJudgeRecord" ADD CONSTRAINT "TemplateJudgeRecord_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateJudgeRecord" ADD CONSTRAINT "TemplateJudgeRecord_judgeRecordId_fkey" FOREIGN KEY ("judgeRecordId") REFERENCES "judge_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_records" ADD CONSTRAINT "judge_records_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_files" ADD CONSTRAINT "judge_files_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadow_files" ADD CONSTRAINT "shadow_files_judgeRecordId_fkey" FOREIGN KEY ("judgeRecordId") REFERENCES "judge_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
