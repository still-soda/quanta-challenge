-- CreateTable
CREATE TABLE "judge_status" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "passedCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "judge_status_problemId_key" ON "judge_status"("problemId");

-- AddForeignKey
ALTER TABLE "judge_status" ADD CONSTRAINT "judge_status_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;
