-- CreateEnum
CREATE TYPE "LayoutType" AS ENUM ('HOME', 'PAGE', 'LANDING');

-- CreateEnum
CREATE TYPE "PageBlockType" AS ENUM (
    'HERO',
    'HERO_SLIDER',
    'TEXT',
    'TEXT_IMAGE',
    'IMAGE_BANNER',
    'PRODUCT_GRID',
    'PRODUCT_CAROUSEL',
    'CATEGORY_GRID',
    'BLOG_GRID',
    'TRUST_BADGES',
    'FAQ',
    'CONTACT_FORM',
    'BRAND_LOGOS',
    'TESTIMONIALS',
    'NEWSLETTER',
    'CUSTOM_SPACER'
);

-- CreateTable
CREATE TABLE "PageLayout" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "layoutType" "LayoutType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL,
    "layoutId" TEXT NOT NULL,
    "type" "PageBlockType" NOT NULL,
    "title" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "content" JSONB NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageLayout_pageId_idx" ON "PageLayout"("pageId");

-- CreateIndex
CREATE INDEX "PageLayout_layoutType_idx" ON "PageLayout"("layoutType");

-- CreateIndex
CREATE INDEX "PageLayout_status_idx" ON "PageLayout"("status");

-- CreateIndex
CREATE INDEX "PageLayout_publishedAt_idx" ON "PageLayout"("publishedAt");

-- CreateIndex
CREATE INDEX "PageBlock_layoutId_idx" ON "PageBlock"("layoutId");

-- CreateIndex
CREATE INDEX "PageBlock_sortOrder_idx" ON "PageBlock"("sortOrder");

-- AddForeignKey
ALTER TABLE "PageLayout" ADD CONSTRAINT "PageLayout_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "PageLayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
