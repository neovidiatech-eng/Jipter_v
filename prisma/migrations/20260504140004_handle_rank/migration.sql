/*
  Warnings:

  - You are about to drop the `level` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "level";

-- CreateTable
CREATE TABLE "ranks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ranks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ranks_name_key" ON "ranks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ranks_slug_key" ON "ranks"("slug");

-- CreateIndex
CREATE INDEX "ranks_name_idx" ON "ranks"("name");
