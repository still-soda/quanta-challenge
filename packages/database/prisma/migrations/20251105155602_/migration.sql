-- CreateTable
CREATE TABLE "user_infos" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "email" TEXT,
    "major" TEXT,
    "identifier" TEXT,
    "birthday" TIMESTAMP(3),
    "bannerImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_infos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_infos_userId_key" ON "user_infos"("userId");

-- AddForeignKey
ALTER TABLE "user_infos" ADD CONSTRAINT "user_infos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_infos" ADD CONSTRAINT "user_infos_bannerImageId_fkey" FOREIGN KEY ("bannerImageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
