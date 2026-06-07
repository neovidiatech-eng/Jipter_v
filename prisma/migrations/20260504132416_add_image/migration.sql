-- AlterTable
ALTER TABLE "session_request" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "image" JSONB;
