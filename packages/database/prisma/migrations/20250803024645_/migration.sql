/*
  Warnings:

  - Made the column `content` on table `virtual_files` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "virtual_files" ADD COLUMN     "fileSystemFsid" TEXT,
ALTER COLUMN "content" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "virtual_files" ADD CONSTRAINT "virtual_files_fileSystemFsid_fkey" FOREIGN KEY ("fileSystemFsid") REFERENCES "file_systems"("fsid") ON DELETE SET NULL ON UPDATE CASCADE;
