-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard', 'very_hard');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('draft', 'invalid', 'ready', 'published');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('failed', 'passed');

-- CreateEnum
CREATE TYPE "ChangeByType" AS ENUM ('user', 'system');

-- CreateEnum
CREATE TYPE "ShadowFileType" AS ENUM ('image', 'text');

-- CreateTable
CREATE TABLE "problems" (
    "pid" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "tags" TEXT[],
    "difficulty" "Difficulty" NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasProject" BOOLEAN DEFAULT false,
    "coverImageId" TEXT,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("pid")
);

-- CreateTable
CREATE TABLE "problem_default_covers" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_default_covers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_records" (
    "rid" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "result" "Result" NOT NULL,
    "reason" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "timeCost" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_records_pkey" PRIMARY KEY ("rid")
);

-- CreateTable
CREATE TABLE "status_transitions" (
    "id" SERIAL NOT NULL,
    "problemId" INTEGER NOT NULL,
    "fromStatus" "Status" NOT NULL,
    "toStatus" "Status" NOT NULL,
    "changeByType" "ChangeByType" NOT NULL,
    "changeByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_files" (
    "id" SERIAL NOT NULL,
    "judgeScript" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,

    CONSTRAINT "judge_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "imageId" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tid")
);

-- CreateTable
CREATE TABLE "file_systems" (
    "fsid" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_systems_pkey" PRIMARY KEY ("fsid")
);

-- CreateTable
CREATE TABLE "projects" (
    "pid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("pid")
);

-- CreateTable
CREATE TABLE "virtual_files" (
    "vid" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_files_pkey" PRIMARY KEY ("vid")
);

-- CreateTable
CREATE TABLE "file_system_states" (
    "sid" TEXT NOT NULL,
    "fsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_system_states_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "shadow_files" (
    "sfid" TEXT NOT NULL,
    "type" "ShadowFileType" NOT NULL,
    "problemId" INTEGER NOT NULL,
    "imageId" TEXT,
    "text" TEXT,
    "jsonb" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shadow_files_pkey" PRIMARY KEY ("sfid")
);

-- CreateIndex
CREATE INDEX "projects_ownerId_problemId_idx" ON "projects"("ownerId", "problemId");

-- CreateIndex
CREATE INDEX "virtual_files_ownerId_idx" ON "virtual_files"("ownerId");

-- AddForeignKey
ALTER TABLE "problem_default_covers" ADD CONSTRAINT "problem_default_covers_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_default_covers" ADD CONSTRAINT "problem_default_covers_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_transitions" ADD CONSTRAINT "status_transitions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_transitions" ADD CONSTRAINT "status_transitions_changeByUserId_fkey" FOREIGN KEY ("changeByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_files" ADD CONSTRAINT "judge_files_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_systems" ADD CONSTRAINT "file_systems_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_systems" ADD CONSTRAINT "file_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("pid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_files" ADD CONSTRAINT "virtual_files_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadow_files" ADD CONSTRAINT "shadow_files_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadow_files" ADD CONSTRAINT "shadow_files_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
