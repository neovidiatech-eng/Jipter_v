-- CreateTable
CREATE TABLE "policy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Important Notice',
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_notice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "policy_active_idx" ON "policy"("active");

-- CreateIndex
CREATE INDEX "policy_notice_active_idx" ON "policy_notice"("active");
