import type { Order, OrderItem, Prisma } from '@prisma/client';
import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { prisma } from '../../lib/prisma.js';
import { sendTemplateMail } from './mail.service.js';

function formatMoney(value: Prisma.Decimal | number): string {
  const amount = typeof value === 'number' ? value : Number(value);
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

function buildOrderItemsHtml(items: OrderItem[]): string {
  if (!items.length) return '';
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${item.nameSnapshot} × ${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(item.total)}</td></tr>`,
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;"><tbody>${rows}</tbody></table>`;
}

async function getSiteName(): Promise<string> {
  const site = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
  });
  return site?.siteName || 'Woontegra';
}

async function buildOrderVariables(
  order: Order & { items: OrderItem[] },
): Promise<Record<string, string>> {
  const siteName = await getSiteName();
  return {
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    orderNumber: order.orderNumber,
    grandTotal: formatMoney(order.grandTotal),
    subtotal: formatMoney(order.subtotal),
    orderItemsHtml: buildOrderItemsHtml(order.items),
    siteName,
    bankInfoHtml: '',
    bankInfoText: '',
    carrierName: '',
    trackingNumber: '',
    trackingUrl: '',
  };
}

export async function sendOrderCreatedEmail(
  order: Order & { items: OrderItem[] },
): Promise<void> {
  const variables = await buildOrderVariables(order);
  await sendTemplateMail('ORDER_CREATED', order.customerEmail, variables);
}

export async function sendBankTransferWaitingEmail(
  order: Order & { items: OrderItem[] },
  bankInfoHtml: string,
  bankInfoText: string,
): Promise<void> {
  const variables = {
    ...(await buildOrderVariables(order)),
    bankInfoHtml,
    bankInfoText,
  };
  await sendTemplateMail('BANK_TRANSFER_WAITING', order.customerEmail, variables);
}
