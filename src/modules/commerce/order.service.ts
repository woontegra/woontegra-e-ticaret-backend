import type { Prisma } from '@prisma/client';
import {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toOrderDto, toOrderSummaryDto } from '../../lib/order.mapper.js';
import { prisma } from '../../lib/prisma.js';
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
    include: { items: true },
  });
  if (!order) throw AppError.notFound('Order not found');
  return toOrderDto(order);
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
    include: { items: true },
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
  await ensureOrder(id);
  await prisma.order.update({ where: { id }, data: { paymentStatus } });
  return loadOrderDto(id);
}

export async function updateOrderShippingStatus(
  id: string,
  shippingStatus: ShippingStatus | null,
) {
  await ensureOrder(id);
  await prisma.order.update({
    where: { id },
    data: { shippingStatus },
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
