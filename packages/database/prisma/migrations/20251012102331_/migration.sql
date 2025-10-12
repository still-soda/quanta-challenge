/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");
