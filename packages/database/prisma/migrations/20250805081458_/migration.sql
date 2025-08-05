-- DropForeignKey
ALTER TABLE "virtual_files" DROP CONSTRAINT "virtual_files_fileSystemFsid_fkey";

-- AddForeignKey
ALTER TABLE "virtual_files" ADD CONSTRAINT "virtual_files_fileSystemFsid_fkey" FOREIGN KEY ("fileSystemFsid") REFERENCES "file_systems"("fsid") ON DELETE CASCADE ON UPDATE CASCADE;
