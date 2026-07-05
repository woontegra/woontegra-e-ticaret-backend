import type { Prisma } from '@prisma/client';
import {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toOrderDto, toOrderSummaryDto } from '../../lib/order.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { sendOrderDigitalDeliveryEmail, sendPaymentReceivedEmail, sendSaasProvisionReadyEmail } from '../mail/mail-order.service.js';
import { maybeNotifyPaymentWaiting } from '../notifications/notification.service.js';
import {
  getAdminOrderDigitalDelivery,
  onOrderPaymentCompleted,
  retryDigitalDeliveryForOrder,
} from './digitalDelivery.service.js';
import {
  getAdminOrderLicenseDelivery,
  retryLicenseForOrderItem,
} from '../license/license-fulfillment.service.js';
import {
  getAdminOrderSaasDelivery,
  retrySaasProvisionForOrderItem,
} from '../saas/saas-fulfillment.service.js';
import type { ListOrdersQuery } from './order.schema.js';

function parseDateStart(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest('Invalid dateFrom');
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseDateEnd(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest('Invalid dateTo');
  }
  date.setHours(23, 59, 59, 999);
  return date;
}

function buildOrderWhere(query: ListOrdersQuery): Prisma.OrderWhereInput {
  const createdAt: Prisma.DateTimeFilter | undefined =
    query.dateFrom || query.dateTo
      ? {
          ...(query.dateFrom ? { gte: parseDateStart(query.dateFrom) } : {}),
          ...(query.dateTo ? { lte: parseDateEnd(query.dateTo) } : {}),
        }
      : undefined;

  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
    ...(query.shippingStatus !== undefined
      ? { shippingStatus: query.shippingStatus }
      : {}),
    ...(query.orderNumber
      ? {
          orderNumber: { contains: query.orderNumber, mode: 'insensitive' },
        }
      : {}),
    ...(query.customer
      ? {
          OR: [
            { customerName: { contains: query.customer, mode: 'insensitive' } },
            {
              customerEmail: { contains: query.customer, mode: 'insensitive' },
            },
          ],
        }
      : {}),
    ...(createdAt ? { createdAt } : {}),
  };
}

async function ensureOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw AppError.notFound('Order not found');
  return order;
}

async function loadOrderDto(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      paymentMethod: true,
      shipment: { include: { carrier: true } },
    },
  });
  if (!order) throw AppError.notFound('Order not found');
  const dto = toOrderDto(order);
  const [digitalDelivery, licenseDelivery, saasDelivery] = await Promise.all([
    getAdminOrderDigitalDelivery(id),
    getAdminOrderLicenseDelivery(id),
    getAdminOrderSaasDelivery(id),
  ]);
  return { ...dto, digitalDelivery, licenseDelivery, saasDelivery };
}

export async function listOrders(query: ListOrdersQuery) {
  const where = buildOrderWhere(query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: orders.map((order) => ({
      ...toOrderSummaryDto(order),
      itemCount: order._count.items,
    })),
    total,
  };
}

export async function getOrderById(id: string) {
  return loadOrderDto(id);
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      paymentMethod: true,
      shipment: { include: { carrier: true } },
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  return toOrderDto(order);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await ensureOrder(id);
  await prisma.order.update({ where: { id }, data: { status } });
  return loadOrderDto(id);
}

export async function updateOrderPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw AppError.notFound('Order not found');

  const previousStatus = order.paymentStatus;

  await prisma.order.update({ where: { id }, data: { paymentStatus } });
  maybeNotifyPaymentWaiting(order, paymentStatus);

  if (
    paymentStatus === PaymentStatus.PAID &&
    previousStatus !== PaymentStatus.PAID
  ) {
    void sendPaymentReceivedEmail(order).catch((error) => {
      console.error('[mail] PAYMENT_RECEIVED failed', error);
    });
    void onOrderPaymentCompleted(id).catch((error) => {
      console.error('[digital-delivery] fulfill failed', error);
    });
  }

  return loadOrderDto(id);
}

export async function retryOrderDigitalDelivery(id: string) {
  await ensureOrder(id);
  await retryDigitalDeliveryForOrder(id);
  return loadOrderDto(id);
}

export async function retryOrderItemLicense(orderId: string, orderItemId: string) {
  const order = await ensureOrder(orderId);
  if (order.paymentStatus !== PaymentStatus.PAID) {
    throw AppError.badRequest('Ödeme tamamlanmadan lisans oluşturulmaz');
  }

  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, orderId },
  });
  if (!item) throw AppError.notFound('Order item not found');

  const result = await retryLicenseForOrderItem(orderItemId);
  if (result.created) {
    void sendOrderDigitalDeliveryEmail(orderId, {
      createdLinks: [],
      licensesCreated: true,
    }).catch((error) => {
      console.error('[mail] license retry delivery failed', error);
    });
  }
  return loadOrderDto(orderId);
}

export async function retryOrderItemSaasProvision(
  orderId: string,
  orderItemId: string,
) {
  const order = await ensureOrder(orderId);
  if (order.paymentStatus !== PaymentStatus.PAID) {
    throw AppError.badRequest('Ödeme tamamlanmadan SaaS hesabı oluşturulmaz');
  }

  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, orderId },
  });
  if (!item) throw AppError.notFound('Order item not found');

  const result = await retrySaasProvisionForOrderItem(orderItemId);
  if (result.created && !result.mailSentBySaas) {
    void sendSaasProvisionReadyEmail(orderId).catch((error) => {
      console.error('[mail] SAAS retry delivery failed', error);
    });
  }
  return loadOrderDto(orderId);
}

export async function updateOrderShippingStatus(
  id: string,
  shippingStatus: ShippingStatus | null,
) {
  await ensureOrder(id);
  const status = shippingStatus ?? ShippingStatus.PENDING;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { shippingStatus: shippingStatus },
    });

    const shipment = await tx.shipment.findUnique({ where: { orderId: id } });

    if (shipment) {
      const now = new Date();
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status,
          ...(status === 'SHIPPED' ||
          status === 'DELIVERED' ||
          status === 'RETURNED'
            ? { shippedAt: shipment.shippedAt ?? now }
            : {}),
          ...(status === 'DELIVERED'
            ? { deliveredAt: shipment.deliveredAt ?? now }
            : {}),
        },
      });
    }
  });

  return loadOrderDto(id);
}

export async function updateOrderAdminNote(
  id: string,
  adminNote: string | null,
) {
  await ensureOrder(id);
  await prisma.order.update({ where: { id }, data: { adminNote } });
  return loadOrderDto(id);
}
