-- CreateTable
CREATE TABLE "weekly_report" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "weekStarting" TIMESTAMP(3) NOT NULL,
    "weekEnding" TIMESTAMP(3) NOT NULL,
    "totalClasses" INTEGER NOT NULL DEFAULT 0,
    "studentsTaught" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "materialsUploaded" INTEGER NOT NULL DEFAULT 0,
    "teachingSummary" TEXT,
    "studentProgress" TEXT,
    "challenges" TEXT,
    "overallRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_report_teacherId_idx" ON "weekly_report"("teacherId");

-- CreateIndex
CREATE INDEX "weekly_report_weekStarting_idx" ON "weekly_report"("weekStarting");

-- AddForeignKey
ALTER TABLE "weekly_report" ADD CONSTRAINT "weekly_report_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
