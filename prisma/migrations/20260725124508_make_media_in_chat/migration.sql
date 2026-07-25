-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mediaUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
