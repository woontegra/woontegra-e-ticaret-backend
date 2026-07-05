import type { Order, OrderItem, Prisma } from '@prisma/client';
import { OrderItemDeliveryStatus } from '@prisma/client';
import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { prisma } from '../../lib/prisma.js';
import { sendTemplateMail } from './mail.service.js';
import type { CreatedDownloadLink } from '../commerce/digitalDelivery.service.js';

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

export async function sendPaymentReceivedEmail(
  order: Order & { items: OrderItem[] },
): Promise<void> {
  const variables = await buildOrderVariables(order);
  await sendTemplateMail('PAYMENT_RECEIVED', order.customerEmail, variables);
}

export async function sendOrderShippedEmail(
  order: Order & { items: OrderItem[] },
  carrierName: string,
  trackingNumber: string,
  trackingUrl: string,
): Promise<void> {
  const variables = {
    ...(await buildOrderVariables(order)),
    carrierName,
    trackingNumber,
    trackingUrl,
  };
  await sendTemplateMail('ORDER_SHIPPED', order.customerEmail, variables);
}

export async function sendOrderDeliveredEmail(
  order: Order & { items: OrderItem[] },
): Promise<void> {
  const variables = await buildOrderVariables(order);
  await sendTemplateMail('ORDER_DELIVERED', order.customerEmail, variables);
}

export async function sendReviewApprovedEmail(input: {
  customerEmail: string;
  customerName: string;
  productName: string;
}): Promise<void> {
  const siteName = await getSiteName();
  await sendTemplateMail('REVIEW_APPROVED', input.customerEmail, {
    customerName: input.customerName,
    productName: input.productName,
    siteName,
  });
}

export function buildBankTransferInfo(
  accounts: Array<{
    bankName: string;
    accountHolder: string;
    iban: string;
    branch?: string | null;
  }>,
): { html: string; text: string } {
  if (!accounts.length) {
    return { html: '', text: '' };
  }

  const htmlRows = accounts
    .map(
      (account) =>
        `<p><strong>${account.bankName}</strong><br/>${account.accountHolder}<br/>IBAN: ${account.iban}${account.branch ? `<br/>${account.branch}` : ''}</p>`,
    )
    .join('');

  const textRows = accounts
    .map(
      (account) =>
        `${account.bankName} — ${account.accountHolder} — IBAN: ${account.iban}${account.branch ? ` (${account.branch})` : ''}`,
    )
    .join('\n');

  return { html: htmlRows, text: textRows };
}

function buildDownloadLinksHtml(links: CreatedDownloadLink[]): string {
  if (!links.length) return '';
  return links
    .map(
      (link) =>
        `<p><strong>${link.label}</strong><br/><a href="${link.url}">${link.url}</a></p>`,
    )
    .join('');
}

function buildDownloadLinksText(links: CreatedDownloadLink[]): string {
  return links.map((link) => `${link.label}: ${link.url}`).join('\n');
}

async function getSupportEmail(): Promise<string> {
  const company = await prisma.companySetting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
  });
  return company?.supportEmail?.trim() || company?.email?.trim() || 'destek@woontegra.com';
}

export async function sendDigitalDownloadReadyEmail(
  orderId: string,
  links: CreatedDownloadLink[],
): Promise<void> {
  if (!links.length) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { deliveryMode: true, name: true } },
        },
      },
    },
  });

  if (!order) return;

  const siteName = await getSiteName();
  const supportEmail = await getSupportEmail();
  const productNames = [...new Set(links.map((link) => link.productName))];
  const expiresAt = links[0]?.expiresAt
    ? new Date(links[0].expiresAt).toLocaleDateString('tr-TR')
    : '';

  const hasLicensed = order.items.some(
    (item) => item.product?.deliveryMode === 'LICENSED_DOWNLOAD',
  );

  const licenseNote = hasLicensed
    ? 'Lisans bilgileriniz ayrıca gönderilecektir. Bu e-postada yalnızca kurulum dosyası bağlantıları yer almaktadır.'
    : '';

  const variables = {
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    productName: productNames.join(', '),
    downloadLinks: buildDownloadLinksText(links),
    downloadLinksHtml: buildDownloadLinksHtml(links),
    downloadLinksText: buildDownloadLinksText(links),
    expiresAt,
    supportEmail,
    licenseNote,
    siteName,
  };

  try {
    await sendTemplateMail(
      'DIGITAL_DOWNLOAD_READY',
      order.customerEmail,
      variables,
    );

    await prisma.orderItem.updateMany({
      where: {
        orderId,
        product: {
          deliveryMode: { in: ['PAID_DOWNLOAD', 'LICENSED_DOWNLOAD'] },
        },
      },
      data: {
        deliveryStatus: OrderItemDeliveryStatus.SENT,
        downloadEmailSentAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.orderItem.updateMany({
      where: {
        orderId,
        product: {
          deliveryMode: { in: ['PAID_DOWNLOAD', 'LICENSED_DOWNLOAD'] },
        },
      },
      data: {
        deliveryStatus: OrderItemDeliveryStatus.FAILED,
        deliveryError:
          error instanceof Error ? error.message : 'E-posta gönderilemedi',
      },
    });
    throw error;
  }
}
