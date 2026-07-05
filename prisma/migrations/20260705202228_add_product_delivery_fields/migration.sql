-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('NONE', 'FREE_DOWNLOAD', 'PAID_DOWNLOAD', 'LICENSED_DOWNLOAD', 'SAAS', 'QUOTE_ONLY');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "compareAtPrice" DECIMAL(12,2),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "downloadFiles" JSONB,
ADD COLUMN     "featureBullets" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "licenseAppCode" TEXT,
ADD COLUMN     "licenseDays" INTEGER,
ADD COLUMN     "licenseMaxDevices" INTEGER,
ADD COLUMN     "licenseMonths" INTEGER,
ADD COLUMN     "licenseRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "purchaseEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "saasAppCode" TEXT,
ADD COLUMN     "saasPlanCode" TEXT,
ADD COLUMN     "saasRequiresLogin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saasTrialDays" INTEGER,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "version" TEXT;

-- AlterTable
ALTER TABLE "SeoSetting" ALTER COLUMN "id" SET DEFAULT 'default';

-- CreateIndex
CREATE INDEX "Product_deliveryMode_idx" ON "Product"("deliveryMode");
