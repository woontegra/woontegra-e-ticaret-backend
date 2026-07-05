-- Composite indexes for common list and layout queries

CREATE INDEX "PageLayout_layoutType_status_pageId_idx" ON "PageLayout"("layoutType", "status", "pageId");

CREATE INDEX "PageBlock_layoutId_isActive_sortOrder_idx" ON "PageBlock"("layoutId", "isActive", "sortOrder");

CREATE INDEX "Product_status_updatedAt_idx" ON "Product"("status", "updatedAt" DESC);

CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt" DESC);
