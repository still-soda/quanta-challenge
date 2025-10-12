-- CreateTable
CREATE TABLE "checkin_achievements" (
    "id" SERIAL NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkin_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkin_achievements_achievementId_key" ON "checkin_achievements"("achievementId");

-- AddForeignKey
ALTER TABLE "checkin_achievements" ADD CONSTRAINT "checkin_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
