-- CreateTable
CREATE TABLE "ThemeSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "activeThemeKey" TEXT NOT NULL DEFAULT 'default',
    "colorPalette" JSONB NOT NULL DEFAULT '{}',
    "typography" JSONB NOT NULL DEFAULT '{}',
    "layout" JSONB NOT NULL DEFAULT '{}',
    "buttonStyle" JSONB NOT NULL DEFAULT '{}',
    "cardStyle" JSONB NOT NULL DEFAULT '{}',
    "headerStyle" JSONB NOT NULL DEFAULT '{}',
    "productCardStyle" JSONB NOT NULL DEFAULT '{}',
    "borderRadius" TEXT NOT NULL DEFAULT 'md',
    "shadowLevel" TEXT NOT NULL DEFAULT 'sm',
    "containerWidth" TEXT NOT NULL DEFAULT '1280px',
    "customCss" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSetting_pkey" PRIMARY KEY ("id")
);
