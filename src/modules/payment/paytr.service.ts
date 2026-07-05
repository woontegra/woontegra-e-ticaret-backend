import type { PaymentMethod, Prisma } from '@prisma/client';
import {
  PaymentStatus,
  PaymentTransactionStatus,
} from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  buildPaytrMerchantReturnUrl,
  buildUserBasket,
  paytrHmacBase64,
  paymentAmountKurus,
  toPaytrCurrency,
  toPaytrMerchantOid,
  verifyPaytrCallbackHash,
} from '../../lib/paytr-utils.js';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import {
  completeOnlineOrderPayment,
  failOnlineOrderPayment,
  recordBankTransferPayment,
} from './payment-provider.service.js';

interface PaytrConfigRaw {
  merchantId?: string;
  merchantKey?: string;
  merchantSalt?: string;
  successUrl?: string | null;
  failUrl?: string | null;
  callbackUrl?: string | null;
}

interface EffectivePaytrConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: '0' | '1';
  successUrlBase: string;
  failUrlBase: string;
  callbackUrl: string;
}

function resolvePaytrConfig(method: PaymentMethod): EffectivePaytrConfig {
  const config = (method.config ?? {}) as PaytrConfigRaw;
  const merchantId = config.merchantId?.trim() ?? '';
  const merchantKey = config.merchantKey?.trim() ?? '';
  const merchantSalt = config.merchantSalt?.trim() ?? '';

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw AppError.badRequest(
      'PayTR yapılandırması eksik. Admin panelden merchant bilgilerini girin.',
    );
  }

  const siteUrl = env.PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:5173';
  const apiUrl = env.API_PUBLIC_URL?.replace(/\/$/, '') ?? `http://localhost:${env.PORT}`;

  const successUrlBase =
    config.successUrl?.trim() ||
    `${siteUrl}/siparis-basarili`;
  const failUrlBase =
    config.failUrl?.trim() ||
    `${siteUrl}/odeme-basarisiz`;
  const callbackUrl =
    config.callbackUrl?.trim() ||
    `${apiUrl}/api/public/payments/paytr/callback`;

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode: method.isTestMode ? '1' : '0',
    successUrlBase,
    failUrlBase,
    callbackUrl,
  };
}

async function getActivePaytrMethod(): Promise<PaymentMethod> {
  const method = await prisma.paymentMethod.findFirst({
    where: { type: 'PAYTR', isActive: true },
  });
  if (!method) {
    throw AppError.badRequest('PayTR ödeme yöntemi aktif değil');
  }
  return method;
}

async function loadOrderForPaytr(orderNumber: string, customerEmail?: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      paymentMethod: true,
      paymentTransactions: {
        where: { provider: 'PAYTR' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    throw AppError.notFound('Sipariş bulunamadı');
  }

  if (
    customerEmail &&
    order.customerEmail.trim().toLowerCase() !== customerEmail.trim().toLowerCase()
  ) {
    throw AppError.notFound('Sipariş bulunamadı');
  }

  return order;
}

export async function startPaytrPayment(input: {
  orderNumber: string;
  customerEmail?: string;
  clientIp: string;
}) {
  const method = await getActivePaytrMethod();
  const paytr = resolvePaytrConfig(method);
  const order = await loadOrderForPaytr(input.orderNumber, input.customerEmail);

  if (order.paymentMethod?.type !== 'PAYTR') {
    throw AppError.badRequest('Bu sipariş PayTR ile oluşturulmamış');
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    throw AppError.badRequest('Bu sipariş zaten ödenmiş');
  }

  if (order.paymentStatus === PaymentStatus.WAITING_BANK_TRANSFER) {
    throw AppError.badRequest(
      'Bu sipariş Havale/EFT ile oluşturulmuştur; kart ödemesi başlatılamaz',
    );
  }

  if (order.paymentStatus === PaymentStatus.FAILED) {
    throw AppError.badRequest('Bu sipariş için ödeme başlatılamaz');
  }

  const existingSuccess = order.paymentTransactions.find(
    (tx) => tx.status === PaymentTransactionStatus.SUCCESS,
  );
  if (existingSuccess) {
    throw AppError.badRequest('Bu sipariş zaten ödenmiş');
  }

  if (order.items.length === 0) {
    throw AppError.badRequest('Sipariş kalemi bulunamadı');
  }

  const paymentAmount = paymentAmountKurus(Number(order.grandTotal));
  const currency = toPaytrCurrency('TRY');
  const userIp = input.clientIp.slice(0, 39) || '127.0.0.1';
  const email = order.customerEmail.slice(0, 100);
  const merchantOid = toPaytrMerchantOid(order.orderNumber);

  if (!merchantOid || merchantOid.length < 6) {
    throw AppError.internal('Sipariş numarası PayTR için uygun değil');
  }

  const basketRows = order.items.map((item) => ({
    productName: item.nameSnapshot,
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
  }));
  const userBasket = buildUserBasket(basketRows);
  const noInstallment = '1';
  const maxInstallment = '0';

  const hashStr =
    paytr.merchantId +
    userIp +
    merchantOid +
    email +
    String(paymentAmount) +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    paytr.testMode;

  const paytrToken = paytrHmacBase64(paytr.merchantKey, hashStr + paytr.merchantSalt);

  const merchantOkUrl = buildPaytrMerchantReturnUrl(
    paytr.successUrlBase,
    order.orderNumber,
  ).slice(0, 400);
  const merchantFailUrl = buildPaytrMerchantReturnUrl(
    paytr.failUrlBase,
    order.orderNumber,
  ).slice(0, 400);

  if (!merchantOkUrl.startsWith('http') || !merchantFailUrl.startsWith('http')) {
    throw AppError.internal('PayTR yönlendirme adresleri geçersiz');
  }

  await prisma.paymentTransaction.deleteMany({
    where: {
      orderId: order.id,
      provider: 'PAYTR',
      status: PaymentTransactionStatus.PENDING,
      providerReference: { not: merchantOid },
    },
  });

  const existingTx = await prisma.paymentTransaction.findFirst({
    where: { orderId: order.id, providerReference: merchantOid },
  });

  if (existingTx) {
    await prisma.paymentTransaction.update({
      where: { id: existingTx.id },
      data: {
        status: PaymentTransactionStatus.PENDING,
        amount: order.grandTotal,
        rawResponse: { phase: 'start_requested' },
      },
    });
  } else {
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: 'PAYTR',
        status: PaymentTransactionStatus.PENDING,
        amount: order.grandTotal,
        currency: 'TRY',
        providerReference: merchantOid,
        rawResponse: { phase: 'start_requested' },
      },
    });
  }

  const body = new URLSearchParams({
    merchant_id: paytr.merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: String(paymentAmount),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: paytr.testMode,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: order.customerName.slice(0, 60),
    user_address: 'Dijital ürün',
    user_phone: (order.customerPhone || '05000000000').slice(0, 20),
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    timeout_limit: '30',
    currency,
    test_mode: paytr.testMode,
    lang: 'tr',
  });

  const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await response.text();
  let json: { status?: string; token?: string; reason?: string };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    throw AppError.serviceUnavailable('PayTR yanıtı okunamadı');
  }

  if (json.status !== 'success' || !json.token) {
    const reason = json.reason || json.status || 'PayTR token alınamadı';
    throw AppError.serviceUnavailable(String(reason));
  }

  await prisma.paymentTransaction.updateMany({
    where: { orderId: order.id, providerReference: merchantOid },
    data: {
      rawResponse: {
        phase: 'token_received',
        tokenReceivedAt: new Date().toISOString(),
      },
    },
  });

  return {
    iframeToken: json.token,
    redirectUrl: `https://www.paytr.com/odeme/guvenli/${json.token}`,
    merchantOid,
    callbackUrl: paytr.callbackUrl,
  };
}

export async function handlePaytrCallback(payload: Record<string, string>) {
  const merchantOid = String(payload.merchant_oid ?? '');
  const status = String(payload.status ?? '');
  const totalAmount = String(payload.total_amount ?? '');
  const hash = String(payload.hash ?? '');

  if (!merchantOid || !status || !totalAmount || !hash) {
    throw AppError.badRequest('Eksik callback parametreleri');
  }

  const method = await getActivePaytrMethod();
  const paytr = resolvePaytrConfig(method);

  const hashOk = verifyPaytrCallbackHash(
    merchantOid,
    status,
    totalAmount,
    hash,
    paytr.merchantKey,
    paytr.merchantSalt,
  );

  if (!hashOk) {
    throw AppError.badRequest('Geçersiz imza');
  }

  const transaction = await prisma.paymentTransaction.findFirst({
    where: { providerReference: merchantOid, provider: 'PAYTR' },
    include: { order: { include: { items: true, paymentMethod: true } } },
  });

  const order =
    transaction?.order ??
    (await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: merchantOid },
          { orderNumber: { contains: merchantOid } },
        ],
      },
      include: { items: true, paymentMethod: true },
    }));

  if (!order) {
    throw AppError.notFound('Sipariş bulunamadı');
  }

  if (order.paymentMethod?.type === 'BANK_TRANSFER') {
    return { ignored: true as const };
  }

  const expectedKurus = paymentAmountKurus(Number(order.grandTotal));
  const receivedKurus = Number.parseInt(totalAmount, 10);
  if (!Number.isFinite(receivedKurus) || receivedKurus !== expectedKurus) {
    throw AppError.badRequest('Tutar uyuşmazlığı');
  }

  const rawJson = payload as unknown as Prisma.InputJsonValue;

  if (order.paymentStatus === PaymentStatus.PAID) {
    if (transaction) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { rawResponse: rawJson },
      });
    }
    return { alreadyPaid: true as const };
  }

  if (status === 'success') {
    let firstCompletion = false;

    await prisma.$transaction(async (tx) => {
      const updated = await tx.paymentTransaction.updateMany({
        where: {
          orderId: order.id,
          provider: 'PAYTR',
          status: PaymentTransactionStatus.PENDING,
        },
        data: {
          status: PaymentTransactionStatus.SUCCESS,
          rawResponse: rawJson,
        },
      });

      firstCompletion = updated.count > 0;
    });

    if (firstCompletion) {
      await completeOnlineOrderPayment(order.id);
    } else {
      const successTx = await prisma.paymentTransaction.findFirst({
        where: {
          orderId: order.id,
          provider: 'PAYTR',
          status: PaymentTransactionStatus.SUCCESS,
        },
      });
      if (successTx) {
        await completeOnlineOrderPayment(order.id);
      }
    }

    return { success: true as const, firstCompletion };
  }

  if (status === 'failed') {
    await failOnlineOrderPayment(order.id, rawJson);
    return { failed: true as const };
  }

  return { ignored: true as const };
}
