-- CreateTable
CREATE TABLE "support" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_category" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_active_idx" ON "support"("active");

-- CreateIndex
CREATE INDEX "support_category_active_idx" ON "support_category"("active");

-- AddForeignKey
ALTER TABLE "support" ADD CONSTRAINT "support_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "support_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
