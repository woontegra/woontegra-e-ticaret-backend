-- CreateEnum
CREATE TYPE "SaasMembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'FAILED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "SaasProvisionStatus" AS ENUM ('PENDING', 'CREATED', 'FAILED', 'SKIPPED');

-- CreateTable StoreCustomer
CREATE TABLE "StoreCustomer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable CustomerSaasMembership
CREATE TABLE "CustomerSaasMembership" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "productId" TEXT NOT NULL,
    "saasAppCode" TEXT NOT NULL,
    "saasPlanCode" TEXT,
    "externalTenantId" TEXT,
    "externalTenantSlug" TEXT,
    "externalLicenseKey" TEXT,
    "loginEmail" TEXT,
    "loginUrl" TEXT,
    "temporaryPassword" TEXT,
    "status" "SaasMembershipStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "provisionedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSaasMembership_pkey" PRIMARY KEY ("id")
);

-- AlterTable OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "saasMembershipId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "saasProvisionStatus" "SaasProvisionStatus";
ALTER TABLE "OrderItem" ADD COLUMN "saasProvisionLastError" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "saasProvisionedAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "saasRenewalDays" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "StoreCustomer_email_key" ON "StoreCustomer"("email");
CREATE INDEX "StoreCustomer_email_idx" ON "StoreCustomer"("email");

CREATE INDEX "CustomerSaasMembership_customerId_idx" ON "CustomerSaasMembership"("customerId");
CREATE INDEX "CustomerSaasMembership_orderId_idx" ON "CustomerSaasMembership"("orderId");
CREATE INDEX "CustomerSaasMembership_orderItemId_idx" ON "CustomerSaasMembership"("orderItemId");
CREATE INDEX "CustomerSaasMembership_productId_idx" ON "CustomerSaasMembership"("productId");
CREATE INDEX "CustomerSaasMembership_saasAppCode_idx" ON "CustomerSaasMembership"("saasAppCode");
CREATE INDEX "CustomerSaasMembership_status_idx" ON "CustomerSaasMembership"("status");
CREATE INDEX "CustomerSaasMembership_externalTenantSlug_idx" ON "CustomerSaasMembership"("externalTenantSlug");

CREATE INDEX "OrderItem_saasMembershipId_idx" ON "OrderItem"("saasMembershipId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "StoreCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_saasMembershipId_fkey" FOREIGN KEY ("saasMembershipId") REFERENCES "CustomerSaasMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CustomerSaasMembership" ADD CONSTRAINT "CustomerSaasMembership_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "StoreCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerSaasMembership" ADD CONSTRAINT "CustomerSaasMembership_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerSaasMembership" ADD CONSTRAINT "CustomerSaasMembership_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
