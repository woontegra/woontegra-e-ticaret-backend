import type {
  PaymentMethod,
  PaymentMethodType,
  Prisma,
} from '@prisma/client';
import type {
  BankTransferPublicConfig,
  PaymentMethodDto,
  PaymentMethodPublicDto,
  PaymentMethodType as ApiPaymentMethodType,
} from '../types/api.js';

export const DEFAULT_PAYMENT_METHODS: Array<{
  type: PaymentMethodType;
  name: string;
  config: Prisma.InputJsonValue;
}> = [
  {
    type: 'BANK_TRANSFER',
    name: 'Havale / EFT',
    config: { accounts: [], instructions: null },
  },
  {
    type: 'CASH_ON_DELIVERY',
    name: 'Kapıda ödeme',
    config: { description: null },
  },
  {
    type: 'PAYTR',
    name: 'PayTR',
    config: { merchantId: '', merchantKey: '', merchantSalt: '' },
  },
  {
    type: 'IYZICO',
    name: 'Iyzico',
    config: {
      apiKey: '',
      secretKey: '',
      baseUrl: 'https://sandbox-api.iyzipay.com',
    },
  },
  {
    type: 'EXTERNAL_LINK',
    name: 'Harici satın alma linki',
    config: { instructions: null },
  },
];

export function toPaymentMethodDto(method: PaymentMethod): PaymentMethodDto {
  return {
    id: method.id,
    type: method.type as ApiPaymentMethodType,
    name: method.name,
    isActive: method.isActive,
    isTestMode: method.isTestMode,
    config: method.config as PaymentMethodDto['config'],
    createdAt: method.createdAt.toISOString(),
    updatedAt: method.updatedAt.toISOString(),
  };
}

export function toPublicPaymentMethodDto(
  method: PaymentMethod,
): PaymentMethodPublicDto {
  const base = {
    id: method.id,
    type: method.type as ApiPaymentMethodType,
    name: method.name,
    isTestMode: method.isTestMode,
  };

  switch (method.type) {
    case 'BANK_TRANSFER': {
      const config = method.config as unknown as BankTransferPublicConfig;
      return {
        ...base,
        config: {
          accounts: config.accounts ?? [],
          instructions: config.instructions ?? null,
        },
      };
    }
    case 'CASH_ON_DELIVERY': {
      const config = method.config as { description?: string | null };
      return {
        ...base,
        config: { description: config.description ?? null },
      };
    }
    case 'EXTERNAL_LINK': {
      const config = method.config as { instructions?: string | null };
      return {
        ...base,
        config: { instructions: config.instructions ?? null },
      };
    }
    default:
      return { ...base, config: {} };
  }
}

export function resolvePaymentStatusForMethod(
  type: PaymentMethodType,
): 'WAITING_BANK_TRANSFER' | 'CASH_ON_DELIVERY' | 'PENDING' {
  switch (type) {
    case 'BANK_TRANSFER':
      return 'WAITING_BANK_TRANSFER';
    case 'CASH_ON_DELIVERY':
      return 'CASH_ON_DELIVERY';
    default:
      return 'PENDING';
  }
}

export function isOnlinePaymentMethod(type: PaymentMethodType): boolean {
  return type === 'PAYTR' || type === 'IYZICO';
}
