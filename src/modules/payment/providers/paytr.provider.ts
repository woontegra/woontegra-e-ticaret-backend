import { BasePaymentProvider } from './base.provider.js';
import type { PaymentInitResult } from '../payment.types.js';
import type { PaymentProviderContext } from './base.provider.js';

export class PaytrProvider extends BasePaymentProvider {
  readonly provider = 'PAYTR' as const;

  async initiatePayment(
    context: PaymentProviderContext,
  ): Promise<PaymentInitResult> {
    const config = context.method.config as {
      merchantId?: string;
      merchantKey?: string;
      merchantSalt?: string;
    };

    this.ensureConfigured(context, {
      merchantId: config.merchantId,
      merchantKey: config.merchantKey,
      merchantSalt: config.merchantSalt,
    });

    // PayTR entegrasyonu: token oluşturma ve yönlendirme URL'si burada üretilecek.
    return {
      kind: 'redirect',
      redirectUrl: null,
      message:
        'PayTR ödeme entegrasyonu iskeleti hazır. Token üretimi sonraki adımda eklenecek.',
      providerReference: null,
    };
  }
}

export class IyzicoProvider extends BasePaymentProvider {
  readonly provider = 'IYZICO' as const;

  async initiatePayment(
    context: PaymentProviderContext,
  ): Promise<PaymentInitResult> {
    const config = context.method.config as {
      apiKey?: string;
      secretKey?: string;
      baseUrl?: string;
    };

    this.ensureConfigured(context, {
      apiKey: config.apiKey,
      secretKey: config.secretKey,
    });

    // Iyzico entegrasyonu: checkout form initialize burada yapılacak.
    return {
      kind: 'redirect',
      redirectUrl: null,
      message:
        'Iyzico ödeme entegrasyonu iskeleti hazır. Checkout form sonraki adımda eklenecek.',
      providerReference: null,
    };
  }
}

export const paytrProvider = new PaytrProvider();
export const iyzicoProvider = new IyzicoProvider();
