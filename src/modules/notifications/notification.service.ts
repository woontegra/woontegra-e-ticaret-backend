import type { NotificationType, Prisma } from '@prisma/client';
import { PaymentStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toNotificationDto } from '../../lib/notification.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { ListNotificationsQuery } from './notification.schema.js';

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({ data: input });
  return toNotificationDto(notification);
}

function fireNotification(input: CreateNotificationInput) {
  void createNotification(input).catch((error) => {
    console.error('[notifications] create failed', error);
  });
}

function formatMoney(value: Prisma.Decimal | number): string {
  const amount = typeof value === 'number' ? value : Number(value);
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

export function notifyNewOrder(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  grandTotal: Prisma.Decimal;
}) {
  fireNotification({
    type: 'NEW_ORDER',
    title: 'Yeni sipariş',
    message: `${order.orderNumber} — ${order.customerName} (${formatMoney(order.grandTotal)})`,
    entityType: 'order',
    entityId: order.id,
  });
}

export function notifyNewContactMessage(message: {
  id: string;
  name: string;
  subject: string | null;
}) {
  fireNotification({
    type: 'NEW_CONTACT_MESSAGE',
    title: 'Yeni iletişim mesajı',
    message: `${message.name}${message.subject ? ` — ${message.subject}` : ''}`,
    entityType: 'contact_message',
    entityId: message.id,
  });
}

export function notifyNewReview(review: {
  id: string;
  name: string;
  productName: string;
  rating: number;
}) {
  fireNotification({
    type: 'NEW_REVIEW',
    title: 'Yeni ürün yorumu',
    message: `${review.name} — ${review.productName} (${review.rating}/5)`,
    entityType: 'product_review',
    entityId: review.id,
  });
}

export function notifyLowStock(product: {
  id: string;
  name: string;
  stockQuantity: number;
}) {
  fireNotification({
    type: 'LOW_STOCK',
    title: 'Stok azaldı',
    message: `${product.name} — kalan stok: ${product.stockQuantity}`,
    entityType: 'product',
    entityId: product.id,
  });
}

export function notifyPaymentWaiting(order: {
  id: string;
  orderNumber: string;
  customerName: string;
}) {
  fireNotification({
    type: 'PAYMENT_WAITING',
    title: 'Ödeme bekliyor',
    message: `${order.orderNumber} — ${order.customerName}`,
    entityType: 'order',
    entityId: order.id,
  });
}

export function notifyShippingTrackingEntered(order: {
  id: string;
  orderNumber: string;
  trackingNumber: string;
}) {
  fireNotification({
    type: 'SHIPPING_TRACKING_ENTERED',
    title: 'Kargo takip numarası girildi',
    message: `${order.orderNumber} — ${order.trackingNumber}`,
    entityType: 'order',
    entityId: order.id,
  });
}

export function shouldNotifyLowStock(
  stockTrackingEnabled: boolean,
  stockQuantity: number | null | undefined,
  lowStockThreshold: number | null | undefined,
): stockQuantity is number {
  if (!stockTrackingEnabled) return false;
  if (stockQuantity === null || stockQuantity === undefined) return false;
  const threshold = lowStockThreshold ?? 5;
  return stockQuantity <= threshold;
}

export function maybeNotifyPaymentWaiting(
  order: { id: string; orderNumber: string; customerName: string },
  paymentStatus: PaymentStatus,
) {
  if (paymentStatus === PaymentStatus.WAITING_BANK_TRANSFER) {
    notifyPaymentWaiting(order);
  }
}

export async function listNotifications(query: ListNotificationsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;
  const where = query.unreadOnly ? { isRead: false } : {};

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items: items.map(toNotificationDto),
    total,
  };
}

export async function getUnreadNotificationCount() {
  const count = await prisma.notification.count({ where: { isRead: false } });
  return { count };
}

export async function markNotificationRead(id: string) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Notification not found');

  const notification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return toNotificationDto(notification);
}

export async function markAllNotificationsRead() {
  const result = await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  return { updated: result.count };
}
