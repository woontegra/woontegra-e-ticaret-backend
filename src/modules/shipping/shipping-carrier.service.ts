import { AppError } from '../../lib/app-error.js';
import { toShippingCarrierDtoWithUrls } from '../../lib/shipping.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateShippingCarrierInput,
  UpdateShippingCarrierInput,
} from './shipping.schema.js';

export async function listShippingCarriers() {
  const carriers = await prisma.shippingCarrier.findMany({
    orderBy: { name: 'asc' },
  });

  return Promise.all(carriers.map(toShippingCarrierDtoWithUrls));
}

export async function listActiveShippingCarriers() {
  const carriers = await prisma.shippingCarrier.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return Promise.all(carriers.map(toShippingCarrierDtoWithUrls));
}

export async function getShippingCarrierById(id: string) {
  const carrier = await prisma.shippingCarrier.findUnique({ where: { id } });

  if (!carrier) {
    throw AppError.notFound('Shipping carrier not found');
  }

  return toShippingCarrierDtoWithUrls(carrier);
}

export async function createShippingCarrier(input: CreateShippingCarrierInput) {
  const carrier = await prisma.shippingCarrier.create({
    data: {
      name: input.name,
      trackingUrlTemplate: input.trackingUrlTemplate,
      logoId: input.logoId ?? null,
      isActive: input.isActive ?? true,
    },
  });

  return toShippingCarrierDtoWithUrls(carrier);
}

export async function updateShippingCarrier(
  id: string,
  input: UpdateShippingCarrierInput,
) {
  const existing = await prisma.shippingCarrier.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Shipping carrier not found');
  }

  const carrier = await prisma.shippingCarrier.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.trackingUrlTemplate !== undefined
        ? { trackingUrlTemplate: input.trackingUrlTemplate }
        : {}),
      ...(input.logoId !== undefined ? { logoId: input.logoId } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toShippingCarrierDtoWithUrls(carrier);
}

export async function deleteShippingCarrier(id: string) {
  const existing = await prisma.shippingCarrier.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Shipping carrier not found');
  }

  await prisma.shippingCarrier.delete({ where: { id } });
}
