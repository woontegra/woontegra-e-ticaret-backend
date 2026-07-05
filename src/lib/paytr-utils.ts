import crypto from 'node:crypto';

export function paytrHmacBase64(secretKey: string, data: string): string {
  return crypto.createHmac('sha256', secretKey).update(data, 'utf8').digest('base64');
}

export function toPaytrCurrency(currency: string): string {
  const normalized = (currency || 'TRY').trim().toUpperCase();
  return normalized === 'TRY' || normalized === 'TL' ? 'TL' : normalized;
}

export function paymentAmountKurus(total: number): number {
  return Math.round(total * 100);
}

/** PayTR merchant_oid: yalnızca harf ve rakam. */
export function toPaytrMerchantOid(orderNumber: string): string {
  return String(orderNumber ?? '').replace(/[^a-zA-Z0-9]/g, '');
}

export function buildUserBasket(
  items: { productName: string; unitPrice: number; quantity: number }[],
): string {
  const basket = items.map((item) => [
    item.productName.slice(0, 200),
    item.unitPrice.toFixed(2),
    item.quantity,
  ]);
  return Buffer.from(JSON.stringify(basket), 'utf8').toString('base64');
}

export function verifyPaytrCallbackHash(
  merchantOid: string,
  status: string,
  totalAmount: string,
  receivedHash: string,
  merchantKey: string,
  merchantSalt: string,
): boolean {
  const data = merchantOid + merchantSalt + status + totalAmount;
  const token = paytrHmacBase64(merchantKey, data);
  return token === receivedHash;
}

export function buildPaytrMerchantReturnUrl(baseRaw: string, orderNumber: string): string {
  const order = String(orderNumber ?? '').trim();
  let base = String(baseRaw ?? '').trim().replace(/\/+$/g, '');
  if (!base || !order) return base;

  const encoded = encodeURIComponent(order);
  if (base.endsWith(`/${encoded}`) || base.endsWith(`/${order}`)) {
    return base;
  }

  const lastSegment = base.split('/').pop() ?? '';
  let decoded = lastSegment;
  try {
    decoded = decodeURIComponent(lastSegment);
  } catch {
    /* keep lastSegment */
  }
  if (decoded === order || lastSegment === order) {
    return base;
  }

  return `${base}/${encoded}`;
}

export const PAYTR_SECURE_PAYMENT_BASE = 'https://www.paytr.com/odeme/guvenli';
