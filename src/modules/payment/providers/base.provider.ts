import type { Order, PaymentMethod } from '@prisma/client';
import { AppError } from '../../../lib/app-error.js';
import type { PaymentInitResult } from '../payment.types.js';

export interface PaymentProviderContext {
  order: Order;
  method: PaymentMethod;
  isTestMode: boolean;
}

export interface PaymentProvider {
  readonly provider: PaymentMethod['type'];
  initiatePayment(context: PaymentProviderContext): Promise<PaymentInitResult>;
}

export abstract class BasePaymentProvider implements PaymentProvider {
  abstract readonly provider: PaymentMethod['type'];

  abstract initiatePayment(
    context: PaymentProviderContext,
  ): Promise<PaymentInitResult>;

  protected ensureConfigured(
    context: PaymentProviderContext,
    fields: Record<string, string | undefined | null>,
  ) {
    const missing = Object.entries(fields)
      .filter(([, value]) => !value?.trim())
      .map(([key]) => key);

    if (missing.length > 0) {
      throw AppError.badRequest(
        `${context.method.name} yapılandırması eksik: ${missing.join(', ')}`,
      );
    }
  }
}
