/*
  Warnings:

  - You are about to drop the column `name_ar` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `name_en` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the `teacher_subject` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,rankId]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ageRange` to the `ranks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rankId` to the `subjects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teacher_subject" DROP CONSTRAINT "teacher_subject_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_subject" DROP CONSTRAINT "teacher_subject_teacherId_fkey";

-- DropIndex
DROP INDEX "subjects_name_ar_idx";

-- DropIndex
DROP INDEX "subjects_name_ar_key";

-- DropIndex
DROP INDEX "subjects_name_en_idx";

-- DropIndex
DROP INDEX "subjects_name_en_key";

-- AlterTable
ALTER TABLE "ranks" ADD COLUMN     "ageRange" JSONB NOT NULL,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "currencyId" TEXT;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "name_ar",
DROP COLUMN "name_en",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 1,
ADD COLUMN     "rankId" TEXT NOT NULL;

-- DropTable
DROP TABLE "teacher_subject";

-- CreateIndex
CREATE INDEX "subjects_name_idx" ON "subjects"("name");

-- CreateIndex
CREATE INDEX "subjects_rankId_idx" ON "subjects"("rankId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_rankId_key" ON "subjects"("name", "rankId");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "ranks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranks" ADD CONSTRAINT "ranks_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
