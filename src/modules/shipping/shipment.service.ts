import { ShippingStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toOrderDto } from '../../lib/order.mapper.js';
import { toShipmentDto } from '../../lib/shipping.mapper.js';
import { buildTrackingUrl } from '../../lib/tracking-url.js';
import { prisma } from '../../lib/prisma.js';
import { notifyShippingTrackingEntered } from '../notifications/notification.service.js';import type { UpdateOrderShipmentInput } from './shipping.schema.js';

const orderInclude = {
  items: true,
  shipment: { include: { carrier: true } },
} as const;

async function loadOrderDto(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  return toOrderDto(order);
}

function resolveShipmentTimestamps(
  status: ShippingStatus,
  existing?: { shippedAt: Date | null; deliveredAt: Date | null } | null,
) {
  const now = new Date();
  const shippedAt =
    status === 'SHIPPED' ||
    status === 'DELIVERED' ||
    status === 'RETURNED'
      ? (existing?.shippedAt ?? now)
      : existing?.shippedAt ?? null;
  const deliveredAt =
    status === 'DELIVERED'
      ? (existing?.deliveredAt ?? now)
      : existing?.deliveredAt ?? null;

  return { shippedAt, deliveredAt };
}

export async function upsertOrderShipment(
  orderId: string,
  input: UpdateOrderShipmentInput,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shipment: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  let carrier: { trackingUrlTemplate: string } | null = null;

  if (input.carrierId) {
    carrier = await prisma.shippingCarrier.findUnique({
      where: { id: input.carrierId },
    });

    if (!carrier) {
      throw AppError.badRequest('Shipping carrier not found');
    }
  } else if (order.shipment?.carrierId) {
    carrier = await prisma.shippingCarrier.findUnique({
      where: { id: order.shipment.carrierId },
    });
  }

  const trackingNumber =
    input.trackingNumber !== undefined
      ? input.trackingNumber
      : (order.shipment?.trackingNumber ?? null);

  const carrierId =
    input.carrierId !== undefined
      ? input.carrierId
      : (order.shipment?.carrierId ?? null);

  const status =
    input.status ??
    order.shipment?.status ??
    order.shippingStatus ??
    ShippingStatus.PENDING;

  const trackingUrl = buildTrackingUrl(
    carrier?.trackingUrlTemplate,
    trackingNumber,
  );

  const timestamps = resolveShipmentTimestamps(status, order.shipment);

  if (order.shipment) {
    await prisma.shipment.update({
      where: { id: order.shipment.id },
      data: {
        carrierId,
        trackingNumber,
        trackingUrl,
        status,
        shippedAt: timestamps.shippedAt,
        deliveredAt: timestamps.deliveredAt,
      },
    });
  } else {
    await prisma.shipment.create({
      data: {
        orderId,
        carrierId,
        trackingNumber,
        trackingUrl,
        status,
        shippedAt: timestamps.shippedAt,
        deliveredAt: timestamps.deliveredAt,
      },
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { shippingStatus: status },
  });

  const hadTracking = Boolean(order.shipment?.trackingNumber?.trim());
  const hasTracking = Boolean(trackingNumber?.trim());
  if (!hadTracking && hasTracking && trackingNumber) {
    notifyShippingTrackingEntered({
      id: order.id,
      orderNumber: order.orderNumber,
      trackingNumber,
    });
  }

  return loadOrderDto(orderId);}

export async function getShipmentByOrderId(orderId: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { orderId },
    include: { carrier: true },
  });

  if (!shipment) {
    return null;
  }

  return toShipmentDto(shipment);
}
