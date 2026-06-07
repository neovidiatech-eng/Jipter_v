/*
  Warnings:

  - You are about to drop the column `subjectId` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_subjectId_fkey";

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "subjectId",
DROP COLUMN "type",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "lectureId" TEXT,
ADD COLUMN     "slidesUrl" TEXT,
ADD COLUMN     "subjectsId" TEXT;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_subjectsId_fkey" FOREIGN KEY ("subjectsId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
