/*
  Warnings:

  - You are about to drop the column `isTemporary` on the `images` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "images" DROP COLUMN "isTemporary",
ADD COLUMN     "refCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
