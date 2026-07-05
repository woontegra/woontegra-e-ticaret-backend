import {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '@prisma/client';
import { z } from 'zod';

export const listOrdersQuerySchema = z.object({
  orderNumber: z.string().optional(),
  customer: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shippingStatus: z.nativeEnum(ShippingStatus).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const updateOrderPaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
});

export const updateOrderShippingStatusSchema = z.object({
  shippingStatus: z.nativeEnum(ShippingStatus).nullable(),
});

export const updateOrderAdminNoteSchema = z.object({
  note: z.string().max(2000).nullable(),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
