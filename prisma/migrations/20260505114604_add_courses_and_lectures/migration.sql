/*
  Warnings:

  - You are about to drop the `curriculum` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "curriculum" DROP CONSTRAINT "curriculum_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "curriculum" DROP CONSTRAINT "curriculum_subjectId_fkey";

-- DropTable
DROP TABLE "curriculum";

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rankId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lectures" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" TIMESTAMP(3),

    CONSTRAINT "lectures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courses_rankId_idx" ON "courses"("rankId");

-- CreateIndex
CREATE INDEX "lectures_courseId_idx" ON "lectures"("courseId");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "ranks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
