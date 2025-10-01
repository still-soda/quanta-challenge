-- CreateTable
CREATE TABLE "daily_problem" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "problemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_checkin" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_checkin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_problem_date_key" ON "daily_problem"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_problem_problemId_key" ON "daily_problem"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_checkin_userId_date_key" ON "daily_checkin"("userId", "date");

-- AddForeignKey
ALTER TABLE "daily_problem" ADD CONSTRAINT "daily_problem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_checkin" ADD CONSTRAINT "daily_checkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
