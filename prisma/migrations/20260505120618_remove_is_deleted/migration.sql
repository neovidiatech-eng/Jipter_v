/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `lectures` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `ranks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "isDeleted";

-- AlterTable
ALTER TABLE "lectures" DROP COLUMN "isDeleted";

-- AlterTable
ALTER TABLE "ranks" DROP COLUMN "isDeleted";
