/*
  Warnings:

  - You are about to drop the column `lectureId` on the `schedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_lectureId_fkey";

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "lectureId",
ADD COLUMN     "lecturesId" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_lecturesId_fkey" FOREIGN KEY ("lecturesId") REFERENCES "lectures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
