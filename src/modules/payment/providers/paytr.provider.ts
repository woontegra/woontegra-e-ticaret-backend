import { BasePaymentProvider } from './base.provider.js';
import type { PaymentInitResult } from '../payment.types.js';
import type { PaymentProviderContext } from './base.provider.js';
import { startPaytrPayment } from '../paytr.service.js';

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

    const result = await startPaytrPayment({
      orderNumber: context.order.orderNumber,
      clientIp: context.clientIp ?? '127.0.0.1',
    });

    return {
      kind: 'redirect',
      redirectUrl: result.redirectUrl,
      iframeToken: result.iframeToken,
      message: null,
      providerReference: result.merchantOid,
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
