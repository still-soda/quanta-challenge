-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "bootCommand" TEXT NOT NULL DEFAULT 'yarn --cwd ./project install',
ADD COLUMN     "buildCommand" TEXT,
ADD COLUMN     "uploadJudgePath" TEXT NOT NULL DEFAULT 'dist';
