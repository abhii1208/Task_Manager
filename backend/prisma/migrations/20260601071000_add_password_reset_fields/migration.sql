-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetPasswordTokenHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);
