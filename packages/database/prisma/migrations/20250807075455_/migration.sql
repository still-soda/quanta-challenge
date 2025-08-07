-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "authorId" TEXT NOT NULL DEFAULT 'cmd7q1sq40001htx4fyaqw476';

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
