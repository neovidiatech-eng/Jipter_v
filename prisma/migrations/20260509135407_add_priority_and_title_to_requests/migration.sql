-- AlterTable
ALTER TABLE "session_request" ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "title" TEXT;
