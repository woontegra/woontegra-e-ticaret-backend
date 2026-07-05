-- CreateTable
CREATE TABLE "SeoSetting" (
    "id" TEXT NOT NULL,
    "defaultTitle" TEXT NOT NULL DEFAULT '',
    "defaultDescription" TEXT NOT NULL DEFAULT '',
    "defaultOgImageId" TEXT,
    "robotsTxt" TEXT NOT NULL DEFAULT '',
    "googleAnalyticsId" TEXT,
    "metaPixelId" TEXT,
    "canonicalBaseUrl" TEXT,
    "sitemapIncludeProducts" BOOLEAN NOT NULL DEFAULT true,
    "sitemapIncludeCategories" BOOLEAN NOT NULL DEFAULT true,
    "sitemapIncludePages" BOOLEAN NOT NULL DEFAULT true,
    "sitemapIncludeBlogPosts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedirectRule" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedirectRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedirectRule_sourcePath_key" ON "RedirectRule"("sourcePath");

-- CreateIndex
CREATE INDEX "RedirectRule_isActive_idx" ON "RedirectRule"("isActive");

-- Seed default SEO settings row
INSERT INTO "SeoSetting" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
