-- CreateEnum
CREATE TYPE "DownloadLogType" AS ENUM ('FREE', 'PAID');
CREATE TYPE "DownloadLogStatus" AS ENUM ('SUCCESS', 'FAILED');
CREATE TYPE "OrderItemDeliveryStatus" AS ENUM ('PENDING', 'READY', 'SENT', 'FAILED');

-- AlterTable OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "downloadTokenCreatedAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "downloadEmailSentAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "deliveryStatus" "OrderItemDeliveryStatus";
ALTER TABLE "OrderItem" ADD COLUMN "deliveryError" TEXT;

-- CreateTable DownloadToken
CREATE TABLE "DownloadToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "productId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "fileType" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DownloadToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable DownloadLog
CREATE TABLE "DownloadLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "mediaAssetId" TEXT,
    "type" "DownloadLogType" NOT NULL,
    "fileType" TEXT,
    "status" "DownloadLogStatus" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable DownloadStat
CREATE TABLE "DownloadStat" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DownloadStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DownloadToken_tokenHash_key" ON "DownloadToken"("tokenHash");
CREATE INDEX "DownloadToken_orderId_idx" ON "DownloadToken"("orderId");
CREATE INDEX "DownloadToken_orderItemId_idx" ON "DownloadToken"("orderItemId");
CREATE INDEX "DownloadToken_productId_idx" ON "DownloadToken"("productId");
CREATE INDEX "DownloadToken_expiresAt_idx" ON "DownloadToken"("expiresAt");

CREATE INDEX "DownloadLog_productId_idx" ON "DownloadLog"("productId");
CREATE INDEX "DownloadLog_orderId_idx" ON "DownloadLog"("orderId");
CREATE INDEX "DownloadLog_createdAt_idx" ON "DownloadLog"("createdAt");

CREATE UNIQUE INDEX "DownloadStat_productId_fileType_key" ON "DownloadStat"("productId", "fileType");
CREATE INDEX "DownloadStat_productId_idx" ON "DownloadStat"("productId");

-- AddForeignKey
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DownloadStat" ADD CONSTRAINT "DownloadStat_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
