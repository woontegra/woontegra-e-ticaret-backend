import { AppError } from '../../lib/app-error.js';
import { toShippingMethodDto } from '../../lib/shipping.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
} from './shipping.schema.js';

export async function listShippingMethods() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { name: 'asc' },
  });

  return methods.map(toShippingMethodDto);
}

export async function getShippingMethodById(id: string) {
  const method = await prisma.shippingMethod.findUnique({ where: { id } });

  if (!method) {
    throw AppError.notFound('Shipping method not found');
  }

  return toShippingMethodDto(method);
}

export async function createShippingMethod(input: CreateShippingMethodInput) {
  const method = await prisma.shippingMethod.create({
    data: {
      name: input.name,
      type: input.type,
      price: input.price,
      freeShippingThreshold:
        input.type === 'FREE_OVER_AMOUNT'
          ? (input.freeShippingThreshold ?? null)
          : null,
      isActive: input.isActive ?? true,
    },
  });

  return toShippingMethodDto(method);
}

export async function updateShippingMethod(
  id: string,
  input: UpdateShippingMethodInput,
) {
  const existing = await prisma.shippingMethod.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Shipping method not found');
  }

  const nextType = input.type ?? existing.type;
  const method = await prisma.shippingMethod.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.freeShippingThreshold !== undefined ||
      input.type !== undefined
        ? {
            freeShippingThreshold:
              nextType === 'FREE_OVER_AMOUNT'
                ? (input.freeShippingThreshold ??
                  (existing.freeShippingThreshold !== null
                    ? Number(existing.freeShippingThreshold)
                    : null))
                : null,
          }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toShippingMethodDto(method);
}

export async function deleteShippingMethod(id: string) {
  const existing = await prisma.shippingMethod.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Shipping method not found');
  }

  await prisma.shippingMethod.delete({ where: { id } });
}
