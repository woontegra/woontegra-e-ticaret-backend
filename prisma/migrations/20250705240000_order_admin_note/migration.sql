-- AlterTable
ALTER TABLE "Order" ADD COLUMN "adminNote" TEXT;

-- CreateIndex
CREATE INDEX "Order_shippingStatus_idx" ON "Order"("shippingStatus");
