-- CreateEnum
CREATE TYPE "LicenseServerStatus" AS ENUM ('PENDING', 'CREATED', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "licenseServerUnitsNotified" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN "licenseServerLicenseKey" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "licenseServerActivationPassword" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "licenseServerExpiresAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "licenseServerLastError" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "licenseServerStatus" "LicenseServerStatus";
