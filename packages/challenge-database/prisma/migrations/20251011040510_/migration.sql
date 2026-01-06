-- AlterTable
ALTER TABLE "achievements" ADD COLUMN     "authorId" TEXT;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
