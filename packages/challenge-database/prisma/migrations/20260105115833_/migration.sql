-- AlterTable
ALTER TABLE "achievements" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;
