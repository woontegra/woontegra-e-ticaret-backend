import type { Prisma } from '@prisma/client';
import type { PaymentMethodType } from '@prisma/client';
import { PaymentTransactionStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { sendPaymentReceivedEmail } from '../mail/mail-order.service.js';
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
  return provider.initiatePayment(context);
}

/** PayTR / Iyzico callback veya test akışında ödeme onaylandığında çağrılır. */
export async function completeOnlineOrderPayment(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return null;

  const wasAlreadyPaid = order.paymentStatus === PaymentStatus.PAID;

  if (!wasAlreadyPaid) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  }

  await prisma.paymentTransaction.updateMany({
    where: {
      orderId,
      provider: { in: ['PAYTR', 'IYZICO'] },
      status: PaymentTransactionStatus.PENDING,
    },
    data: { status: PaymentTransactionStatus.SUCCESS },
  });

  if (!wasAlreadyPaid) {
    void sendPaymentReceivedEmail(order).catch((error) => {
      console.error('[mail] PAYMENT_RECEIVED failed', error);
    });
    void onOrderPaymentCompleted(orderId).catch((error) => {
      console.error('[digital-delivery] online payment fulfill failed', error);
    });
  }

  return order;
}

export async function failOnlineOrderPayment(
  orderId: string,
  rawResponse?: Prisma.InputJsonValue,
) {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
    },
    data: { paymentStatus: PaymentStatus.FAILED },
  });

  await prisma.paymentTransaction.updateMany({
    where: {
      orderId,
      provider: 'PAYTR',
      status: {
        in: [PaymentTransactionStatus.PENDING, PaymentTransactionStatus.PROCESSING],
      },
    },
    data: {
      status: PaymentTransactionStatus.FAILED,
      ...(rawResponse !== undefined ? { rawResponse } : {}),
    },
  });
}

export async function recordBankTransferPayment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const existing = await prisma.paymentTransaction.findFirst({
    where: {
      orderId,
      provider: 'BANK_TRANSFER',
      status: PaymentTransactionStatus.SUCCESS,
    },
  });

  if (existing) return;

  await prisma.paymentTransaction.create({
    data: {
      orderId,
      provider: 'BANK_TRANSFER',
      status: PaymentTransactionStatus.SUCCESS,
      amount: order.grandTotal,
      currency: 'TRY',
      providerReference: order.orderNumber,
      rawResponse: { source: 'admin_manual_approval' },
    },
  });
}
