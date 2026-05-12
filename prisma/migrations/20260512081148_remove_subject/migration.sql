/*
  Warnings:

  - You are about to drop the column `subjectId` on the `exam` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `homework` table. All the data in the column will be lost.
  - You are about to drop the `subjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "exam" DROP CONSTRAINT "exam_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "homework" DROP CONSTRAINT "homework_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_rankId_fkey";

-- DropIndex
DROP INDEX "homework_subjectId_idx";

-- AlterTable
ALTER TABLE "exam" DROP COLUMN "subjectId";

-- AlterTable
ALTER TABLE "homework" DROP COLUMN "subjectId";

-- DropTable
DROP TABLE "subjects";
