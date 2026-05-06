/*
  Warnings:

  - You are about to drop the column `gender` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student" DROP COLUMN "gender";

-- AlterTable
ALTER TABLE "teacher" DROP COLUMN "gender";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" TEXT;
