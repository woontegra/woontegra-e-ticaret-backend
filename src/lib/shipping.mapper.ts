import type {
  Prisma,
  Shipment,
  ShippingCarrier,
  ShippingMethod,
} from '@prisma/client';
import type {
  ShipmentDto,
  ShippingCarrierDto,
  ShippingMethodDto,
} from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function toShippingMethodDto(method: ShippingMethod): ShippingMethodDto {
  return {
    id: method.id,
    name: method.name,
    type: method.type,
    price: decimalToNumber(method.price)!,
    freeShippingThreshold: decimalToNumber(method.freeShippingThreshold),
    isActive: method.isActive,
    createdAt: method.createdAt.toISOString(),
    updatedAt: method.updatedAt.toISOString(),
  };
}

export function toShippingCarrierDto(
  carrier: ShippingCarrier,
  logoUrl: string | null = null,
): ShippingCarrierDto {
  return {
    id: carrier.id,
    name: carrier.name,
    trackingUrlTemplate: carrier.trackingUrlTemplate,
    logoId: carrier.logoId,
    logoUrl,
    isActive: carrier.isActive,
    createdAt: carrier.createdAt.toISOString(),
    updatedAt: carrier.updatedAt.toISOString(),
  };
}

export async function toShippingCarrierDtoWithUrls(
  carrier: ShippingCarrier,
): Promise<ShippingCarrierDto> {
  const urlMap = await resolveMediaUrlMap([carrier.logoId]);
  const logoUrl = carrier.logoId
    ? (urlMap.get(carrier.logoId) ?? null)
    : null;
  return toShippingCarrierDto(carrier, logoUrl);
}

type ShipmentWithCarrier = Shipment & {
  carrier?: ShippingCarrier | null;
};

export function toShipmentDto(shipment: ShipmentWithCarrier): ShipmentDto {
  return {
    id: shipment.id,
    orderId: shipment.orderId,
    carrierId: shipment.carrierId,
    carrierName: shipment.carrier?.name ?? null,
    trackingNumber: shipment.trackingNumber,
    trackingUrl: shipment.trackingUrl,
    status: shipment.status,
    shippedAt: shipment.shippedAt?.toISOString() ?? null,
    deliveredAt: shipment.deliveredAt?.toISOString() ?? null,
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt.toISOString(),
  };
}
