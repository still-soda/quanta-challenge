/*
  Warnings:

  - You are about to drop the column `isListed` on the `achievement_dep_data_loaders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "achievement_dep_data_loaders" DROP COLUMN "isListed",
ADD COLUMN     "isList" BOOLEAN NOT NULL DEFAULT true;
