-- AlterTable
ALTER TABLE "problem_version_transitions" ADD COLUMN     "changeByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "problem_version_transitions" ADD CONSTRAINT "problem_version_transitions_changeByUserId_fkey" FOREIGN KEY ("changeByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
