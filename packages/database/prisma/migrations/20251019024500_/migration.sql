-- CreateTable
CREATE TABLE "achievement_pre_achievements" (
    "id" SERIAL NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "preAchievementId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_pre_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_pre_achievements_achievementId_preAchievementId_key" ON "achievement_pre_achievements"("achievementId", "preAchievementId");

-- AddForeignKey
ALTER TABLE "achievement_pre_achievements" ADD CONSTRAINT "achievement_pre_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_pre_achievements" ADD CONSTRAINT "achievement_pre_achievements_preAchievementId_fkey" FOREIGN KEY ("preAchievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
