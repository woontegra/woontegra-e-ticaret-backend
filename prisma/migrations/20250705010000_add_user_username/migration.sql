-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill existing rows if any
UPDATE "User" SET "username" = split_part("email", '@', 1) WHERE "username" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
