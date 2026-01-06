/*
  Warnings:

  - You are about to drop the column `url` on the `images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "images" DROP COLUMN "url",
ALTER COLUMN "name" DROP DEFAULT;
