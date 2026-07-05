import type { DeliveryMode, MediaAsset, OrderItemDeliveryStatus } from '@prisma/client';
import {
  DeliveryMode as DeliveryModeEnum,
  DownloadLogStatus,
  DownloadLogType,
  OrderItemDeliveryStatus as DeliveryStatusEnum,
  PaymentStatus,
  ProductStatus,
} from '@prisma/client';
import type { Request, Response } from 'express';
import { AppError } from '../../lib/app-error.js';
import {
  buildFreeDownloadPath,
  buildPaidDownloadPath,
  buildPaidDownloadUrl,
  generateRawDownloadToken,
  getDownloadTokenExpiryDate,
  hashDownloadToken,
} from '../../lib/download-token.js';
import {
  parseDownloadFiles,
  type ProductDownloadFilesConfig,
} from '../../lib/product-download-files.js';
import { streamMediaAssetDownload } from '../../lib/storage/download-stream.js';
import { prisma } from '../../lib/prisma.js';
import { sendOrderDigitalDeliveryEmail, sendSaasProvisionReadyEmail } from '../mail/mail-order.service.js';
import type { PublicDownloadLinkDto } from '../../types/api.js';
import { fulfillLicensesForPaidOrder } from '../license/license-fulfillment.service.js';
import { fulfillSaasForPaidOrder } from '../saas/saas-fulfillment.service.js';

const PAID_DELIVERY_MODES: DeliveryMode[] = [
  DeliveryModeEnum.PAID_DOWNLOAD,
  DeliveryModeEnum.LICENSED_DOWNLOAD,
];

type DownloadFileEntry = NonNullable<ProductDownloadFilesConfig>['files'] extends
  | (infer T)[]
  | undefined
  ? T
  : never;

export interface CreatedDownloadLink {
  productId: string;
  productName: string;
  fileType: string;
  label: string;
  url: string;
  relativeUrl: string;
  expiresAt: string;
}

function normalizeFileType(raw: string): 'setup' | 'portable' | 'other' {
  const value = raw.toLowerCase();
  if (value === 'setup' || value === 'portable') return value;
  return 'other';
}

function fileTypeLabel(fileType: string): string {
  if (fileType === 'setup') return 'Kurulum';
  if (fileType === 'portable') return 'Portable';
  return 'Dosya';
}

function findDownloadFile(
  config: ProductDownloadFilesConfig,
  fileType: string,
): DownloadFileEntry | null {
  const normalized = normalizeFileType(fileType);
  const files = config?.files ?? [];
  return (
    files.find((file) => normalizeFileType(file.type ?? 'other') === normalized) ??
    files.find((file) => file.type === fileType) ??
    null
  );
}

async function resolveMediaAssetForFile(
  file: DownloadFileEntry,
): Promise<MediaAsset> {
  if (!file.mediaAssetId?.trim()) {
    throw AppError.notFound('Download file not configured');
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: file.mediaAssetId },
  });

  if (!asset || asset.usageType !== 'DOWNLOAD_BINARY') {
    throw AppError.notFound('Download file not found');
  }

  return asset;
}

function getClientMeta(req: Request) {
  return {
    ipAddress:
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      null,
    userAgent: req.headers['user-agent'] ?? null,
  };
}

async function writeDownloadLog(input: {
  productId: string;
  orderId?: string | null;
  orderItemId?: string | null;
  mediaAssetId?: string | null;
  type: DownloadLogType;
  fileType?: string | null;
  status: DownloadLogStatus;
  ipAddress?: string | null;
  userAgent?: string | null;
  errorMessage?: string | null;
}) {
  await prisma.downloadLog.create({ data: input });
}

async function incrementDownloadStat(productId: string, fileType: string) {
  const now = new Date();
  await prisma.downloadStat.upsert({
    where: {
      productId_fileType: { productId, fileType },
    },
    create: {
      productId,
      fileType,
      count: 1,
      lastDownloadedAt: now,
    },
    update: {
      count: { increment: 1 },
      lastDownloadedAt: now,
    },
  });
}

export async function handleFreeDownload(
  productSlug: string,
  fileType: string,
  req: Request,
  res: Response,
): Promise<void> {
  const meta = getClientMeta(req);
  let productId: string | null = null;

  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: productSlug,
        status: ProductStatus.ACTIVE,
        deliveryMode: DeliveryModeEnum.FREE_DOWNLOAD,
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    productId = product.id;
    const config = parseDownloadFiles(product.downloadFiles);
    const file = findDownloadFile(config, fileType);

    if (!file) {
      throw AppError.notFound('Download file not found');
    }

    const asset = await resolveMediaAssetForFile(file);
    await streamMediaAssetDownload(asset, req, res);

    await incrementDownloadStat(product.id, normalizeFileType(fileType));
    await writeDownloadLog({
      productId: product.id,
      mediaAssetId: asset.id,
      type: DownloadLogType.FREE,
      fileType: normalizeFileType(fileType),
      status: DownloadLogStatus.SUCCESS,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  } catch (error) {
    if (productId && !res.headersSent) {
      await writeDownloadLog({
        productId,
        type: DownloadLogType.FREE,
        fileType: normalizeFileType(fileType),
        status: DownloadLogStatus.FAILED,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        errorMessage: error instanceof Error ? error.message : 'Download failed',
      }).catch(() => undefined);
    }

    if (error instanceof AppError) throw error;
    if (!res.headersSent) {
      throw AppError.internal('Download failed');
    }
  }
}

export async function handlePaidDownload(
  rawToken: string,
  req: Request,
  res: Response,
): Promise<void> {
  const meta = getClientMeta(req);
  const tokenHash = hashDownloadToken(rawToken);

  const token = await prisma.downloadToken.findUnique({
    where: { tokenHash },
    include: {
      order: true,
      product: true,
    },
  });

  if (!token || token.revokedAt) {
    throw AppError.notFound('Download link not found');
  }

  if (token.expiresAt.getTime() < Date.now()) {
    throw AppError.badRequest('Download link expired');
  }

  if (token.maxUses !== null && token.usedCount >= token.maxUses) {
    throw AppError.badRequest('Download limit reached');
  }

  if (token.order.paymentStatus !== PaymentStatus.PAID) {
    throw AppError.forbidden('Payment required before download');
  }

  if (!PAID_DELIVERY_MODES.includes(token.product.deliveryMode)) {
    throw AppError.forbidden('Product is not downloadable');
  }

  try {
    let asset: MediaAsset | null = null;

    if (token.mediaAssetId) {
      asset = await prisma.mediaAsset.findUnique({
        where: { id: token.mediaAssetId },
      });
    }

    if (!asset) {
      const config = parseDownloadFiles(token.product.downloadFiles);
      const file = token.fileType
        ? findDownloadFile(config, token.fileType)
        : (config?.files?.[0] ?? null);
      if (file) {
        asset = await resolveMediaAssetForFile(file);
      }
    }

    if (!asset) {
      throw AppError.notFound('Download file not found');
    }

    await streamMediaAssetDownload(asset, req, res);

    await prisma.downloadToken.update({
      where: { id: token.id },
      data: { usedCount: { increment: 1 } },
    });

    await incrementDownloadStat(token.productId, token.fileType ?? 'other');

    await writeDownloadLog({
      productId: token.productId,
      orderId: token.orderId,
      orderItemId: token.orderItemId,
      mediaAssetId: asset.id,
      type: DownloadLogType.PAID,
      fileType: token.fileType,
      status: DownloadLogStatus.SUCCESS,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  } catch (error) {
    if (!res.headersSent) {
      await writeDownloadLog({
        productId: token.productId,
        orderId: token.orderId,
        orderItemId: token.orderItemId,
        mediaAssetId: token.mediaAssetId,
        type: DownloadLogType.PAID,
        fileType: token.fileType,
        status: DownloadLogStatus.FAILED,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        errorMessage: error instanceof Error ? error.message : 'Download failed',
      }).catch(() => undefined);
    }

    if (error instanceof AppError) throw error;
    if (!res.headersSent) {
      throw AppError.internal('Download failed');
    }
  }
}

async function createTokenForFile(input: {
  orderId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  mediaAssetId: string;
  fileType: string;
  label: string;
  skipIfExists?: boolean;
}): Promise<CreatedDownloadLink | null> {
  if (input.skipIfExists !== false) {
    const existing = await prisma.downloadToken.findFirst({
      where: {
        orderItemId: input.orderItemId,
        mediaAssetId: input.mediaAssetId,
        fileType: input.fileType,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      return null;
    }
  }

  const rawToken = generateRawDownloadToken();
  const expiresAt = getDownloadTokenExpiryDate();

  await prisma.downloadToken.create({
    data: {
      tokenHash: hashDownloadToken(rawToken),
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      productId: input.productId,
      mediaAssetId: input.mediaAssetId,
      fileType: input.fileType,
      expiresAt,
      maxUses: null,
    },
  });

  return {
    productId: input.productId,
    productName: input.productName,
    fileType: input.fileType,
    label: input.label,
    url: buildPaidDownloadUrl(rawToken),
    relativeUrl: buildPaidDownloadPath(rawToken),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function fulfillDigitalDownloadsForPaidOrder(
  orderId: string,
  options?: { sendEmail?: boolean },
): Promise<{
  fulfilled: boolean;
  failed: boolean;
  createdLinks: CreatedDownloadLink[];
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (order.paymentStatus !== PaymentStatus.PAID) {
    return { fulfilled: false, failed: false, createdLinks: [] };
  }

  const createdLinks: CreatedDownloadLink[] = [];
  let anyReady = false;
  let anyFailed = false;

  for (const item of order.items) {
    if (!item.productId) continue;

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || !PAID_DELIVERY_MODES.includes(product.deliveryMode)) {
      continue;
    }

    const config = parseDownloadFiles(product.downloadFiles);
    const files = config?.files ?? [];

    if (!files.length) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          deliveryStatus: DeliveryStatusEnum.FAILED,
          deliveryError: 'İndirilebilir dosya tanımlı değil',
        },
      });
      anyFailed = true;
      continue;
    }

    let itemReady = false;
    let itemError: string | null = null;

    for (const file of files) {
      try {
        if (!file.mediaAssetId?.trim()) {
          itemError = 'Dosya medya kaydı eksik';
          continue;
        }

        const created = await createTokenForFile({
          orderId: order.id,
          orderItemId: item.id,
          productId: product.id,
          productName: product.name,
          mediaAssetId: file.mediaAssetId,
          fileType: normalizeFileType(file.type ?? 'other'),
          label: file.buttonLabel || file.label,
        });

        if (created) {
          itemReady = true;
          createdLinks.push(created);
        } else {
          const existingToken = await prisma.downloadToken.findFirst({
            where: {
              orderItemId: item.id,
              mediaAssetId: file.mediaAssetId,
              fileType: normalizeFileType(file.type ?? 'other'),
              revokedAt: null,
              expiresAt: { gt: new Date() },
            },
          });
          if (existingToken) {
            itemReady = true;
          }
        }
      } catch (error) {
        itemError =
          error instanceof Error ? error.message : 'Token oluşturulamadı';
      }
    }

    const deliveryStatus: OrderItemDeliveryStatus = itemReady
      ? DeliveryStatusEnum.READY
      : DeliveryStatusEnum.FAILED;

    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        deliveryStatus,
        deliveryError: itemReady ? null : itemError,
        downloadTokenCreatedAt: itemReady
          ? item.downloadTokenCreatedAt ?? new Date()
          : item.downloadTokenCreatedAt,
      },
    });

    if (itemReady) anyReady = true;
    if (!itemReady) anyFailed = true;
  }

  const shouldSendEmail = options?.sendEmail === true && createdLinks.length > 0;

  if (shouldSendEmail) {
    void sendOrderDigitalDeliveryEmail(orderId, {
      createdLinks,
      licensesCreated: false,
    }).catch((error) => {
      console.error('[mail] DIGITAL_DOWNLOAD_READY failed', error);
    });
  } else if (anyReady && createdLinks.length === 0 && options?.sendEmail === true) {
    await prisma.orderItem.updateMany({
      where: {
        orderId,
        deliveryStatus: DeliveryStatusEnum.READY,
        downloadEmailSentAt: null,
      },
      data: {
        deliveryStatus: DeliveryStatusEnum.SENT,
      },
    });
  }

  return { fulfilled: anyReady, failed: anyFailed, createdLinks };
}

export async function retryDigitalDeliveryForOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Order not found');

  if (order.paymentStatus !== PaymentStatus.PAID) {
    throw AppError.badRequest('Ödeme tamamlanmadan teslimat yapılmaz');
  }

  await prisma.downloadToken.updateMany({
    where: {
      orderId,
      revokedAt: null,
      usedCount: 0,
    },
    data: { revokedAt: new Date() },
  });

  return fulfillDigitalDownloadsForPaidOrder(orderId, { sendEmail: true });
}

export async function getPublicOrderDownloadLinks(
  orderNumber: string,
  customerEmail: string,
): Promise<PublicDownloadLinkDto[]> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (
    order.customerEmail.trim().toLowerCase() !==
    customerEmail.trim().toLowerCase()
  ) {
    throw AppError.notFound('Order not found');
  }

  if (order.paymentStatus !== PaymentStatus.PAID) {
    return [];
  }

  const result = await fulfillDigitalDownloadsForPaidOrder(order.id, {
    sendEmail: false,
  });

  const links: PublicDownloadLinkDto[] = result.createdLinks.map((link) => ({
    productName: link.productName,
    fileType: link.fileType,
    label: link.label,
    downloadUrl: link.relativeUrl,
    expiresAt: link.expiresAt,
  }));

  if (links.length === 0) {
    const tokens = await prisma.downloadToken.findMany({
      where: {
        orderId: order.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        product: { select: { name: true, deliveryMode: true } },
      },
    });

    for (const token of tokens) {
      if (!PAID_DELIVERY_MODES.includes(token.product.deliveryMode)) continue;
      links.push({
        productName: token.product.name,
        fileType: token.fileType,
        label: fileTypeLabel(token.fileType ?? 'other'),
        note: 'İndirme bağlantısı e-posta adresinize gönderildi',
        expiresAt: token.expiresAt.toISOString(),
      });
    }
  }

  return links;
}

export async function getAdminOrderDigitalDelivery(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              deliveryMode: true,
            },
          },
          downloadTokens: {
            where: { revokedAt: null },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!order) throw AppError.notFound('Order not found');

  return order.items
    .filter(
      (item) =>
        item.product &&
        PAID_DELIVERY_MODES.includes(item.product.deliveryMode),
    )
    .map((item) => ({
      orderItemId: item.id,
      productName: item.nameSnapshot,
      deliveryMode: item.product!.deliveryMode,
      deliveryStatus: item.deliveryStatus,
      deliveryError: item.deliveryError,
      downloadTokenCreatedAt: item.downloadTokenCreatedAt?.toISOString() ?? null,
      downloadEmailSentAt: item.downloadEmailSentAt?.toISOString() ?? null,
      tokenCount: item.downloadTokens.length,
      canFulfill: order.paymentStatus === PaymentStatus.PAID,
    }));
}

export function buildPublicFreeDownloadPath(
  productSlug: string,
  fileType: string,
): string {
  return buildFreeDownloadPath(productSlug, fileType);
}

export async function onOrderPaymentCompleted(orderId: string) {
  const downloadResult = await fulfillDigitalDownloadsForPaidOrder(orderId, {
    sendEmail: false,
  });

  const licenseResult = await fulfillLicensesForPaidOrder(orderId);
  const saasResult = await fulfillSaasForPaidOrder(orderId);

  if (downloadResult.createdLinks.length > 0 || licenseResult.createdCount > 0) {
    void sendOrderDigitalDeliveryEmail(orderId, {
      createdLinks: downloadResult.createdLinks,
      licensesCreated: licenseResult.createdCount > 0,
    }).catch((error) => {
      console.error('[mail] order digital delivery failed', error);
    });
  }

  if (saasResult.provisionedCount > 0 && !saasResult.mailSentBySaas) {
    void sendSaasProvisionReadyEmail(orderId).catch((error) => {
      console.error('[mail] SAAS_PROVISION_READY failed', error);
    });
  }

  return { downloadResult, licenseResult, saasResult };
}
