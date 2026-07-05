import { PaymentMethodType } from '@prisma/client';
import { z } from 'zod';

const bankAccountSchema = z.object({
  bankName: z.string().min(1).max(120),
  accountHolder: z.string().min(1).max(120),
  iban: z.string().min(5).max(34),
  branch: z.string().max(120).nullable().optional(),
});

const bankTransferConfigSchema = z.object({
  accounts: z.array(bankAccountSchema).default([]),
  instructions: z.string().max(2000).nullable().optional(),
});

const cashOnDeliveryConfigSchema = z.object({
  description: z.string().max(1000).nullable().optional(),
});

const paytrConfigSchema = z.object({
  merchantId: z.string().max(200).default(''),
  merchantKey: z.string().max(500).default(''),
  merchantSalt: z.string().max(500).default(''),
});

const iyzicoConfigSchema = z.object({
  apiKey: z.string().max(500).default(''),
  secretKey: z.string().max(500).default(''),
  baseUrl: z.string().url().max(500).optional(),
});

const externalLinkConfigSchema = z.object({
  instructions: z.string().max(2000).nullable().optional(),
});

export const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
  isTestMode: z.boolean().optional(),
  config: z.unknown().optional(),
});

export function validatePaymentMethodConfig(
  type: PaymentMethodType,
  config: unknown,
) {
  switch (type) {
    case 'BANK_TRANSFER':
      return bankTransferConfigSchema.parse(config);
    case 'CASH_ON_DELIVERY':
      return cashOnDeliveryConfigSchema.parse(config);
    case 'PAYTR':
      return paytrConfigSchema.parse(config);
    case 'IYZICO':
      return iyzicoConfigSchema.parse(config);
    case 'EXTERNAL_LINK':
      return externalLinkConfigSchema.parse(config);
    default:
      return config;
  }
}

export type UpdatePaymentMethodInput = z.infer<
  typeof updatePaymentMethodSchema
>;
