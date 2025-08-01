/*
  Warnings:

  - You are about to drop the column `description` on the `problems` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `problems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "problems" DROP COLUMN "description",
DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "_ProblemToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProblemToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProblemToTag_B_index" ON "_ProblemToTag"("B");

-- AddForeignKey
ALTER TABLE "_ProblemToTag" ADD CONSTRAINT "_ProblemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemToTag" ADD CONSTRAINT "_ProblemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("tid") ON DELETE CASCADE ON UPDATE CASCADE;
