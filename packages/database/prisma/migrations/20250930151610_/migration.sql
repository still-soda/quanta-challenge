/*
  Warnings:

  - You are about to drop the `daily_checkin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_problem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "daily_checkin" DROP CONSTRAINT "daily_checkin_userId_fkey";

-- DropForeignKey
ALTER TABLE "daily_problem" DROP CONSTRAINT "daily_problem_problemId_fkey";

-- DropTable
DROP TABLE "daily_checkin";

-- DropTable
DROP TABLE "daily_problem";

-- CreateTable
CREATE TABLE "daily_problems" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "problemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_checkins" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_problems_date_key" ON "daily_problems"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_problems_problemId_key" ON "daily_problems"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_checkins_userId_date_key" ON "daily_checkins"("userId", "date");

-- AddForeignKey
ALTER TABLE "daily_problems" ADD CONSTRAINT "daily_problems_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
