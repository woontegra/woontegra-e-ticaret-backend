-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'VERCEL_BLOB', 'R2');

-- CreateEnum
CREATE TYPE "MediaUsageType" AS ENUM (
  'IMAGE',
  'LOGO',
  'FAVICON',
  'HERO_IMAGE',
  'PRODUCT_IMAGE',
  'BLOG_IMAGE',
  'BUILDER_IMAGE',
  'CAMPAIGN_IMAGE',
  'DOCUMENT',
  'DOWNLOAD_BINARY'
);

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "MediaAsset" ADD COLUMN "bucket" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN "publicUrl" TEXT;

-- Migrate usageType from text to enum (best-effort mapping)
ALTER TABLE "MediaAsset" ADD COLUMN "usageTypeNew" "MediaUsageType";

UPDATE "MediaAsset"
SET "usageTypeNew" = CASE
  WHEN "usageType" ILIKE 'download%' THEN 'DOWNLOAD_BINARY'::"MediaUsageType"
  WHEN "usageType" ILIKE 'logo%' THEN 'LOGO'::"MediaUsageType"
  WHEN "usageType" ILIKE 'favicon%' THEN 'FAVICON'::"MediaUsageType"
  WHEN "usageType" ILIKE 'hero%' THEN 'HERO_IMAGE'::"MediaUsageType"
  WHEN "usageType" ILIKE 'product%' THEN 'PRODUCT_IMAGE'::"MediaUsageType"
  WHEN "usageType" ILIKE 'blog%' THEN 'BLOG_IMAGE'::"MediaUsageType"
  WHEN "usageType" ILIKE 'builder%' THEN 'BUILDER_IMAGE'::"MediaUsageType"
  WHEN "usageType" ILIKE 'campaign%' THEN 'CAMPAIGN_IMAGE'::"MediaUsageType"
  WHEN "usageType" ILIKE 'document%' THEN 'DOCUMENT'::"MediaUsageType"
  WHEN "mimeType" LIKE 'image/%' THEN 'IMAGE'::"MediaUsageType"
  ELSE NULL
END;

ALTER TABLE "MediaAsset" DROP COLUMN "usageType";
ALTER TABLE "MediaAsset" RENAME COLUMN "usageTypeNew" TO "usageType";

-- url becomes nullable (R2 private binaries may not have public URL)
ALTER TABLE "MediaAsset" ALTER COLUMN "url" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MediaAsset_storageProvider_idx" ON "MediaAsset"("storageProvider");
CREATE INDEX "MediaAsset_usageType_idx" ON "MediaAsset"("usageType");
