-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "role_transitions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "fromRole" "UserRole" NOT NULL,
    "toRole" "UserRole" NOT NULL,
    "changeByType" "ChangeByType" NOT NULL,
    "changeByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_transitions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "role_transitions" ADD CONSTRAINT "role_transitions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
