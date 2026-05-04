-- CreateTable
CREATE TABLE "level" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "level_name_idx" ON "level"("name");
