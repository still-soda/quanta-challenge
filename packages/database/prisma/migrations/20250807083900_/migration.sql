/*
  Warnings:

  - You are about to drop the `_ProblemToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_system_states` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `baseId` to the `problems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ProblemToTag" DROP CONSTRAINT "_ProblemToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProblemToTag" DROP CONSTRAINT "_ProblemToTag_B_fkey";

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "baseId" INTEGER NOT NULL,
ADD COLUMN     "isDeprecated" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "_ProblemToTag";

-- DropTable
DROP TABLE "file_system_states";

-- CreateTable
CREATE TABLE "base_problems" (
    "id" SERIAL NOT NULL,
    "currentPid" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "base_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_version_transitions" (
    "id" SERIAL NOT NULL,
    "baseProblemId" INTEGER NOT NULL,
    "fromId" INTEGER NOT NULL,
    "toId" INTEGER NOT NULL,
    "changeByType" "ChangeByType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_version_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProblemsToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProblemsToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "base_problems_currentPid_key" ON "base_problems"("currentPid");

-- CreateIndex
CREATE INDEX "_ProblemsToTags_B_index" ON "_ProblemsToTags"("B");

-- AddForeignKey
ALTER TABLE "base_problems" ADD CONSTRAINT "base_problems_currentPid_fkey" FOREIGN KEY ("currentPid") REFERENCES "problems"("pid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "base_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_version_transitions" ADD CONSTRAINT "problem_version_transitions_baseProblemId_fkey" FOREIGN KEY ("baseProblemId") REFERENCES "base_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_version_transitions" ADD CONSTRAINT "problem_version_transitions_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_version_transitions" ADD CONSTRAINT "problem_version_transitions_toId_fkey" FOREIGN KEY ("toId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemsToTags" ADD CONSTRAINT "_ProblemsToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemsToTags" ADD CONSTRAINT "_ProblemsToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("tid") ON DELETE CASCADE ON UPDATE CASCADE;
