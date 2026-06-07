/*
  Warnings:

  - You are about to drop the column `currencyId` on the `ranks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ranks" DROP CONSTRAINT "ranks_currencyId_fkey";

-- AlterTable
ALTER TABLE "ranks" DROP COLUMN "currencyId";
