import type { PaymentMethod, PaymentMethodType, Prisma } from '@prisma/client';
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

function maskPaytrConfig(config: Record<string, unknown>) {
  return {
    merchantId: typeof config.merchantId === 'string' ? config.merchantId : '',
    merchantKey: '',
    merchantSalt: '',
    hasMerchantKey: Boolean(config.merchantKey),
    hasMerchantSalt: Boolean(config.merchantSalt),
  };
}

function maskIyzicoConfig(config: Record<string, unknown>) {
  return {
    apiKey: '',
    secretKey: '',
    hasApiKey: Boolean(config.apiKey),
    hasSecretKey: Boolean(config.secretKey),
    baseUrl:
      typeof config.baseUrl === 'string'
        ? config.baseUrl
        : 'https://sandbox-api.iyzipay.com',
  };
}

export function maskPaymentMethodConfig(
  type: PaymentMethodType,
  config: unknown,
  options?: { maskSecrets?: boolean },
) {
  const maskSecrets = options?.maskSecrets ?? true;
  const record = (config ?? {}) as Record<string, unknown>;

  if (!maskSecrets) return config as PaymentMethodDto['config'];

  switch (type) {
    case 'PAYTR':
      return maskPaytrConfig(record);
    case 'IYZICO':
      return maskIyzicoConfig(record);
    default:
      return config as PaymentMethodDto['config'];
  }
}

export function mergePaymentMethodConfig(
  type: PaymentMethodType,
  existing: unknown,
  incoming: unknown,
) {
  const current = (existing ?? {}) as Record<string, unknown>;
  const next = (incoming ?? {}) as Record<string, unknown>;

  switch (type) {
    case 'PAYTR': {
      const merged = {
        merchantId:
          typeof next.merchantId === 'string'
            ? next.merchantId
            : String(current.merchantId ?? ''),
        merchantKey:
          typeof next.merchantKey === 'string' && next.merchantKey.trim()
            ? next.merchantKey
            : String(current.merchantKey ?? ''),
        merchantSalt:
          typeof next.merchantSalt === 'string' && next.merchantSalt.trim()
            ? next.merchantSalt
            : String(current.merchantSalt ?? ''),
      };
      return merged;
    }
    case 'IYZICO': {
      return {
        apiKey:
          typeof next.apiKey === 'string' && next.apiKey.trim()
            ? next.apiKey
            : String(current.apiKey ?? ''),
        secretKey:
          typeof next.secretKey === 'string' && next.secretKey.trim()
            ? next.secretKey
            : String(current.secretKey ?? ''),
        baseUrl:
          typeof next.baseUrl === 'string' && next.baseUrl.trim()
            ? next.baseUrl
            : String(
                current.baseUrl ?? 'https://sandbox-api.iyzipay.com',
              ),
      };
    }
    default:
      return next;
  }
}

export function toPaymentMethodDto(
  method: PaymentMethod,
  options?: { maskSecrets?: boolean },
): PaymentMethodDto {
  return {
    id: method.id,
    type: method.type as ApiPaymentMethodType,
    name: method.name,
    isActive: method.isActive,
    isTestMode: method.isTestMode,
    config: maskPaymentMethodConfig(method.type, method.config, options) as PaymentMethodDto['config'],
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
