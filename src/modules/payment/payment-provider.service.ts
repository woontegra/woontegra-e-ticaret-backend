import type { PaymentMethodType } from '@prisma/client';
import { PaymentTransactionStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { onOrderPaymentCompleted } from '../commerce/digitalDelivery.service.js';
import type { PaymentInitResult } from './payment.types.js';
import type { PaymentProvider } from './providers/base.provider.js';
import { iyzicoProvider, paytrProvider } from './providers/paytr.provider.js';
import type { PaymentProviderContext } from './providers/base.provider.js';

const providers = new Map<PaymentMethodType, PaymentProvider>([
  ['PAYTR', paytrProvider],
  ['IYZICO', iyzicoProvider],
]);

export async function initiateOnlinePayment(
  context: PaymentProviderContext,
): Promise<PaymentInitResult | null> {
  const provider = providers.get(context.method.type);
  if (!provider) return null;

  const result = await provider.initiatePayment(context);

  await prisma.paymentTransaction.create({
    data: {
      orderId: context.order.id,
      provider: context.method.type,
      status: PaymentTransactionStatus.PENDING,
      amount: context.order.grandTotal,
      currency: 'TRY',
      providerReference: result.providerReference ?? null,
      rawResponse: {
        kind: result.kind,
        message: result.message ?? null,
        skeleton: true,
      },
    },
  });

  return result;
}

/** PayTR / Iyzico callback veya test akışında ödeme onaylandığında çağrılır. */
export async function completeOnlineOrderPayment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  if (order.paymentStatus === PaymentStatus.PAID) {
    return order;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: PaymentStatus.PAID },
    include: { items: true },
  });

  await prisma.paymentTransaction.updateMany({
    where: { orderId, status: PaymentTransactionStatus.PENDING },
    data: { status: PaymentTransactionStatus.SUCCESS },
  });

  void onOrderPaymentCompleted(orderId).catch((error) => {
    console.error('[digital-delivery] online payment fulfill failed', error);
  });

  return updated;
}
