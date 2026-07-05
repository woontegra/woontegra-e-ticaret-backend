import type { PaymentMethod, Prisma } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  DEFAULT_PAYMENT_METHODS,
  mergePaymentMethodConfig,
  toPaymentMethodDto,
  toPublicPaymentMethodDto,
} from '../../lib/payment.mapper.js';
import { prisma } from '../../lib/prisma.js';
import {
  updatePaymentMethodSchema,
  validatePaymentMethodConfig,
  type UpdatePaymentMethodInput,
} from './payment.schema.js';

async function ensureDefaultPaymentMethods() {
  for (const defaults of DEFAULT_PAYMENT_METHODS) {
    await prisma.paymentMethod.upsert({
      where: { type: defaults.type },
      create: {
        type: defaults.type,
        name: defaults.name,
        config: defaults.config,
        isActive: false,
        isTestMode: true,
      },
      update: {},
    });
  }
}

export async function listPaymentMethods() {
  await ensureDefaultPaymentMethods();
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { type: 'asc' },
  });
  return methods.map((method) => toPaymentMethodDto(method, { maskSecrets: true }));
}

export async function getPaymentMethodById(id: string) {
  await ensureDefaultPaymentMethods();
  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method) throw AppError.notFound('Payment method not found');
  return toPaymentMethodDto(method, { maskSecrets: true });
}

export async function updatePaymentMethod(
  id: string,
  input: UpdatePaymentMethodInput,
) {
  const parsed = updatePaymentMethodSchema.parse(input);
  const existing = await prisma.paymentMethod.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Payment method not found');
  }

  let config: Prisma.InputJsonValue = existing.config as Prisma.InputJsonValue;
  if (parsed.config !== undefined) {
    const merged = mergePaymentMethodConfig(
      existing.type,
      existing.config,
      parsed.config,
    );
    config = validatePaymentMethodConfig(
      existing.type,
      merged,
    ) as Prisma.InputJsonValue;
  }

  const method = await prisma.paymentMethod.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.isActive !== undefined ? { isActive: parsed.isActive } : {}),
      ...(parsed.isTestMode !== undefined ? { isTestMode: parsed.isTestMode } : {}),
      ...(parsed.config !== undefined ? { config } : {}),
    },
  });

  return toPaymentMethodDto(method, { maskSecrets: true });
}

export async function listPublicPaymentMethods() {
  await ensureDefaultPaymentMethods();
  const methods = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    orderBy: { type: 'asc' },
  });
  return methods.map(toPublicPaymentMethodDto);
}

export async function getActivePaymentMethodById(id: string) {
  const method = await prisma.paymentMethod.findFirst({
    where: { id, isActive: true },
  });

  if (!method) {
    throw AppError.badRequest('Selected payment method is not available');
  }

  return method;
}

export async function validatePaymentMethodForCheckout(
  paymentMethodId: string,
): Promise<PaymentMethod> {
  return getActivePaymentMethodById(paymentMethodId);
}
