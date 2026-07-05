-- AlterEnum
ALTER TYPE "MenuItemType" ADD VALUE 'PRODUCT_CATEGORY';

-- AlterTable
ALTER TABLE "HeaderSetting" ADD COLUMN "favoritesUrl" TEXT;
