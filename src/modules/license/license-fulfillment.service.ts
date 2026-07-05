import {
  DeliveryMode,
  LicenseServerStatus,
  PaymentStatus,
} from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  createOrderLicense,
  isLicenseServerConfigured,
} from './license-server.client.js';
import { env } from '../../config/index.js';
import type { OrderLicenseDeliveryItemDto } from '../../types/api.js';

function buildExternalUnitKey(
  orderNumber: string,
  orderItemId: string,
  unitIndex: number,
): string {
  return `${orderNumber}:${orderItemId}:${unitIndex}`;
}

function resolveLicenseDays(product: {
  licenseDays: number | null;
  licenseMonths: number | null;
}): number | null {
  if (product.licenseDays && product.licenseDays > 0) {
    return product.licenseDays;
  }
  if (product.licenseMonths && product.licenseMonths > 0) {
    return product.licenseMonths * 30;
  }
  return null;
}

async function loadLicensedOrderItem(orderItemId: string) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: true,
      product: true,
    },
  });

  if (!item) {
    throw AppError.notFound('Order item not found');
  }

  return item;
}

function validateLicensedProduct(product: {
  deliveryMode: DeliveryMode;
  licenseRequired: boolean;
  licenseAppCode: string | null;
  licenseDays: number | null;
  licenseMonths: number | null;
  licenseMaxDevices: number | null;
}): string | null {
  if (product.deliveryMode !== DeliveryMode.LICENSED_DOWNLOAD) {
    return 'Ürün lisanslı indirme modunda değil';
  }
  if (!product.licenseRequired) {
    return 'licenseRequired etkin değil';
  }
  if (!product.licenseAppCode?.trim()) {
    return 'licenseAppCode tanımlı değil';
  }
  if (!resolveLicenseDays(product)) {
    return 'licenseDays veya licenseMonths tanımlı değil';
  }
  if (!product.licenseMaxDevices || product.licenseMaxDevices < 1) {
    return 'licenseMaxDevices tanımlı değil';
  }
  return null;
}

export async function fulfillLicenseForOrderItem(orderItemId: string) {
  const item = await loadLicensedOrderItem(orderItemId);

  if (item.order.paymentStatus !== PaymentStatus.PAID) {
    return { created: false, reason: 'Payment not completed' };
  }

  if (!item.product) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        licenseServerStatus: LicenseServerStatus.FAILED,
        licenseServerLastError: 'Ürün kaydı bulunamadı',
      },
    });
    return { created: false, reason: 'Product missing' };
  }

  const validationError = validateLicensedProduct(item.product);
  if (validationError) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        licenseServerStatus: LicenseServerStatus.FAILED,
        licenseServerLastError: validationError,
      },
    });
    return { created: false, reason: validationError };
  }

  if (
    item.licenseServerStatus === LicenseServerStatus.CREATED &&
    item.licenseServerUnitsNotified >= item.quantity
  ) {
    return { created: false, reason: 'Already fulfilled' };
  }

  if (!env.LICENSE_SERVER_ENABLED) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        licenseServerStatus: LicenseServerStatus.SKIPPED,
        licenseServerLastError: 'Lisans sunucusu entegrasyonu devre dışı',
      },
    });
    return { created: false, reason: 'License server disabled' };
  }

  if (!isLicenseServerConfigured()) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        licenseServerStatus: LicenseServerStatus.FAILED,
        licenseServerLastError:
          'Lisans sunucusu yapılandırılmamış (LICENSE_SERVER_URL / LICENSE_SERVER_INTEGRATION_SECRET)',
      },
    });
    return { created: false, reason: 'License server not configured' };
  }

  let unitsNotified = item.licenseServerUnitsNotified;
  let lastError: string | null = null;
  let created = false;

  for (let unitIndex = unitsNotified; unitIndex < item.quantity; unitIndex += 1) {
    const response = await createOrderLicense({
      externalOrderNo: item.order.orderNumber,
      externalOrderItemId: item.id,
      externalUnitKey: buildExternalUnitKey(
        item.order.orderNumber,
        item.id,
        unitIndex,
      ),
      customerName: item.order.customerName,
      customerEmail: item.order.customerEmail,
      customerPhone: item.order.customerPhone,
      productName: item.nameSnapshot,
      licenseAppCode: item.product.licenseAppCode!.trim(),
      licenseDays: item.product.licenseDays,
      licenseMonths: item.product.licenseMonths,
      licenseMaxDevices: item.product.licenseMaxDevices,
      quantity: 1,
    });

    if (!response.ok || !response.licenseKey) {
      lastError = response.error ?? response.message ?? 'Lisans oluşturulamadı';
      break;
    }

    unitsNotified += 1;
    created = true;

    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        licenseServerUnitsNotified: unitsNotified,
        licenseServerLicenseKey: response.licenseKey,
        licenseServerActivationPassword: response.activationPassword ?? null,
        licenseServerExpiresAt: response.expiresAt
          ? new Date(response.expiresAt)
          : null,
        licenseServerLastError: null,
        licenseServerStatus:
          unitsNotified >= item.quantity
            ? LicenseServerStatus.CREATED
            : LicenseServerStatus.PENDING,
      },
    });
  }

  if (!created && lastError) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        licenseServerStatus: LicenseServerStatus.FAILED,
        licenseServerLastError: lastError,
      },
    });
  }

  return {
    created,
    unitsNotified,
    error: lastError,
  };
}

export async function fulfillLicensesForPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (order.paymentStatus !== PaymentStatus.PAID) {
    return { fulfilled: false, createdCount: 0 };
  }

  let createdCount = 0;

  for (const item of order.items) {
    if (item.product?.deliveryMode !== DeliveryMode.LICENSED_DOWNLOAD) {
      continue;
    }

    const result = await fulfillLicenseForOrderItem(item.id);
    if (result.created) {
      createdCount += 1;
    }
  }

  return { fulfilled: createdCount > 0, createdCount };
}

export async function retryLicenseForOrderItem(orderItemId: string) {
  const item = await loadLicensedOrderItem(orderItemId);

  if (item.order.paymentStatus !== PaymentStatus.PAID) {
    throw AppError.badRequest('Ödeme tamamlanmadan lisans oluşturulmaz');
  }

  if (
    item.licenseServerStatus === LicenseServerStatus.CREATED &&
    item.licenseServerUnitsNotified >= item.quantity
  ) {
    throw AppError.badRequest(
      'Lisans zaten oluşturulmuş. Yeniden üretmek için mevcut akış desteklenmiyor.',
    );
  }

  if (item.licenseServerStatus !== LicenseServerStatus.FAILED) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        licenseServerStatus: LicenseServerStatus.PENDING,
        licenseServerLastError: null,
      },
    });
  }

  return fulfillLicenseForOrderItem(orderItemId);
}

export async function getAdminOrderLicenseDelivery(
  orderId: string,
): Promise<OrderLicenseDeliveryItemDto[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              deliveryMode: true,
              licenseAppCode: true,
            },
          },
        },
      },
    },
  });

  if (!order) throw AppError.notFound('Order not found');

  return order.items
    .filter((item) => item.product?.deliveryMode === DeliveryMode.LICENSED_DOWNLOAD)
    .map((item) => ({
      orderItemId: item.id,
      productName: item.nameSnapshot,
      licenseAppCode: item.product?.licenseAppCode ?? null,
      licenseServerStatus: item.licenseServerStatus,
      licenseServerLicenseKey: item.licenseServerLicenseKey,
      licenseServerActivationPassword: item.licenseServerActivationPassword,
      licenseServerExpiresAt: item.licenseServerExpiresAt?.toISOString() ?? null,
      licenseServerLastError: item.licenseServerLastError,
      licenseServerUnitsNotified: item.licenseServerUnitsNotified,
      quantity: item.quantity,
      canRetry:
        order.paymentStatus === PaymentStatus.PAID &&
        item.licenseServerStatus === LicenseServerStatus.FAILED,
      canFulfill: order.paymentStatus === PaymentStatus.PAID,
    }));
}
