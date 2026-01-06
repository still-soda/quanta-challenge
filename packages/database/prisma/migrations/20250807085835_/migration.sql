/*
  Warnings:

  - You are about to drop the column `authorId` on the `problems` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `base_problems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "problems" DROP CONSTRAINT "problems_authorId_fkey";

-- AlterTable
ALTER TABLE "base_problems" ADD COLUMN     "authorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "problems" DROP COLUMN "authorId";

-- AddForeignKey
ALTER TABLE "base_problems" ADD CONSTRAINT "base_problems_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
