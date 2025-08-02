-- DropForeignKey
ALTER TABLE "user_images" DROP CONSTRAINT "user_images_imageId_fkey";

-- AddForeignKey
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
