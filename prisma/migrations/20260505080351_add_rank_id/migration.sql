-- AlterTable
ALTER TABLE "student" ADD COLUMN     "rankId" TEXT;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "ranks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
