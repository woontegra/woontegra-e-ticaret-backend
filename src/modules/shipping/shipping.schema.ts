import { ShippingMethodType, ShippingStatus } from '@prisma/client';
import { z } from 'zod';

const optionalMediaId = z.string().min(1).nullable().optional();

export const createShippingCarrierSchema = z.object({
  name: z.string().min(1).max(120),
  trackingUrlTemplate: z.string().min(1).max(500),
  logoId: optionalMediaId,
  isActive: z.boolean().optional(),
});

export const updateShippingCarrierSchema = createShippingCarrierSchema.partial();

export const createShippingMethodSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.nativeEnum(ShippingMethodType),
  price: z.coerce.number().min(0),
  freeShippingThreshold: z.coerce.number().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateShippingMethodSchema = createShippingMethodSchema.partial();

export const updateOrderShipmentSchema = z.object({
  carrierId: z.string().min(1).nullable().optional(),
  trackingNumber: z.string().max(120).nullable().optional(),
  status: z.nativeEnum(ShippingStatus).optional(),
});

export type CreateShippingCarrierInput = z.infer<
  typeof createShippingCarrierSchema
>;
export type UpdateShippingCarrierInput = z.infer<
  typeof updateShippingCarrierSchema
>;
export type CreateShippingMethodInput = z.infer<
  typeof createShippingMethodSchema
>;
export type UpdateShippingMethodInput = z.infer<
  typeof updateShippingMethodSchema
>;
export type UpdateOrderShipmentInput = z.infer<
  typeof updateOrderShipmentSchema
>;
