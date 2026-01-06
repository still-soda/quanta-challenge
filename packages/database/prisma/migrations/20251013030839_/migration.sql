-- CreateTable
CREATE TABLE "ranking_histories" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ranking_histories" ADD CONSTRAINT "ranking_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
