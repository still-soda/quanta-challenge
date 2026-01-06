-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
