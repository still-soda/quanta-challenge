-- CreateTable
CREATE TABLE "AchievementDependencyDataRequestRecord" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "sql" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementDependencyDataRequestRecord_pkey" PRIMARY KEY ("id")
);
