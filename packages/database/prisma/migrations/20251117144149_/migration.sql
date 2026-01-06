-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "initCommand" TEXT,
ALTER COLUMN "bootCommand" DROP NOT NULL;
