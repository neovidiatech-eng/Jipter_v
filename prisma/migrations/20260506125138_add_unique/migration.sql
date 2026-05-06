/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,order]` on the table `lectures` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "lectures" ALTER COLUMN "order" DROP DEFAULT;

-- CreateTable
CREATE TABLE "user_lectures" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rank_history" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rankId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rank_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_lectures_userId_idx" ON "user_lectures"("userId");

-- CreateIndex
CREATE INDEX "user_lectures_lectureId_idx" ON "user_lectures"("lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "user_lectures_userId_lectureId_key" ON "user_lectures"("userId", "lectureId");

-- CreateIndex
CREATE INDEX "user_rank_history_studentId_idx" ON "user_rank_history"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_title_key" ON "courses"("title");

-- CreateIndex
CREATE UNIQUE INDEX "lectures_courseId_order_key" ON "lectures"("courseId", "order");

-- AddForeignKey
ALTER TABLE "user_lectures" ADD CONSTRAINT "user_lectures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lectures" ADD CONSTRAINT "user_lectures_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "ranks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
