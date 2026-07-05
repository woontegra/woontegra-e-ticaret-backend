-- CreateEnum
CREATE TYPE "HeaderLogoPosition" AS ENUM ('LEFT', 'CENTER');

-- CreateEnum
CREATE TYPE "HeaderMenuPosition" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- CreateTable
CREATE TABLE "HeaderSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "logoPosition" "HeaderLogoPosition" NOT NULL DEFAULT 'LEFT',
    "menuPosition" "HeaderMenuPosition" NOT NULL DEFAULT 'CENTER',
    "headerHeight" TEXT NOT NULL DEFAULT '3.5rem',
    "stickyHeader" BOOLEAN NOT NULL DEFAULT false,
    "showSearch" BOOLEAN NOT NULL DEFAULT true,
    "showAccountIcon" BOOLEAN NOT NULL DEFAULT true,
    "showFavoritesIcon" BOOLEAN NOT NULL DEFAULT false,
    "showCartIcon" BOOLEAN NOT NULL DEFAULT true,
    "topBarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "topBarText" TEXT,
    "topBarBackground" TEXT,
    "topBarTextColor" TEXT,
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "announcementText" TEXT,
    "announcementLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderSetting_pkey" PRIMARY KEY ("id")
);
