-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'WAITING_BANK_TRANSFER';
ALTER TYPE "PaymentStatus" ADD VALUE 'CASH_ON_DELIVERY';

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('BANK_TRANSFER', 'CASH_ON_DELIVERY', 'PAYTR', 'IYZICO', 'EXTERNAL_LINK');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentMethodId" TEXT;

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isTestMode" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "PaymentMethodType" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "providerReference" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_type_key" ON "PaymentMethod"("type");

-- CreateIndex
CREATE INDEX "PaymentMethod_isActive_idx" ON "PaymentMethod"("isActive");

-- CreateIndex
CREATE INDEX "Order_paymentMethodId_idx" ON "Order"("paymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_orderId_idx" ON "PaymentTransaction"("orderId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_provider_idx" ON "PaymentTransaction"("provider");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default payment methods
INSERT INTO "PaymentMethod" ("id", "type", "name", "isActive", "isTestMode", "config", "createdAt", "updatedAt")
VALUES
  ('pm_bank_transfer', 'BANK_TRANSFER', 'Havale / EFT', false, true, '{"accounts":[],"instructions":null}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pm_cod', 'CASH_ON_DELIVERY', 'Kapıda ödeme', false, true, '{"description":null}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pm_paytr', 'PAYTR', 'PayTR', false, true, '{"merchantId":"","merchantKey":"","merchantSalt":""}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pm_iyzico', 'IYZICO', 'Iyzico', false, true, '{"apiKey":"","secretKey":"","baseUrl":"https://sandbox-api.iyzipay.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pm_external', 'EXTERNAL_LINK', 'Harici satın alma linki', false, true, '{"instructions":null}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
