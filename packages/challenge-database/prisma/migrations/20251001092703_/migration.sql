/*
  Warnings:

  - You are about to drop the `AchievementDependencyDataRequestRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AchievementDependencyDataRequestRecord";

-- CreateTable
CREATE TABLE "achievement_dependency_data_request_records" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "sql" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_dependency_data_request_records_pkey" PRIMARY KEY ("id")
);
