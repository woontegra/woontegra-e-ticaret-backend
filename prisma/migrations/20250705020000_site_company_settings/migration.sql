-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT '',
    "siteDescription" TEXT NOT NULL DEFAULT '',
    "defaultSeoTitle" TEXT NOT NULL DEFAULT '',
    "defaultSeoDescription" TEXT NOT NULL DEFAULT '',
    "domain" TEXT NOT NULL DEFAULT '',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "logoMediaId" TEXT,
    "faviconMediaId" TEXT,
    "ogImageMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT '',
    "tradeName" TEXT NOT NULL DEFAULT '',
    "taxNumber" TEXT NOT NULL DEFAULT '',
    "taxOffice" TEXT NOT NULL DEFAULT '',
    "mersisNumber" TEXT,
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "workingHours" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "defaultTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySetting_pkey" PRIMARY KEY ("id")
);

-- Seed singleton rows
INSERT INTO "SiteSetting" ("id", "updatedAt") VALUES ('default', CURRENT_TIMESTAMP);
INSERT INTO "CompanySetting" ("id", "updatedAt") VALUES ('default', CURRENT_TIMESTAMP);
