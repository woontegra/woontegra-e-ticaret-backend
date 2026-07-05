import type { DeliveryMode, ProductKind, ProductStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { LegacyProduct } from './types.js';

const SAAS_SLUGS = new Set([
  'muvekkil-kasa-saas',
  'muvekkil-kasa-defteri-saas',
  'muvekkil-kasa-defteri-web-tabanli',
]);

export function mapLegacyDeliveryMode(product: LegacyProduct): {
  productKind: ProductKind;
  deliveryMode: DeliveryMode;
  purchaseEnabled: boolean;
  licenseRequired: boolean;
  saasAppCode: string | null;
  saasPlanCode: string | null;
  saasRequiresLogin: boolean;
} {
  const legacyType = product.legacyProductType ?? 'DOWNLOAD';

  if (legacyType === 'SERVICE') {
    return {
      productKind: 'SERVICE',
      deliveryMode: 'QUOTE_ONLY',
      purchaseEnabled: product.purchaseEnabled ?? false,
      licenseRequired: false,
      saasAppCode: null,
      saasPlanCode: null,
      saasRequiresLogin: false,
    };
  }

  const isSaas =
    legacyType === 'SAAS' ||
    Boolean(product.saasAppCode) ||
    SAAS_SLUGS.has(product.slug) ||
    product.licenseAppCode === 'MUVEKKIL_KASA_SAAS';

  if (isSaas) {
    return {
      productKind: 'SOFTWARE',
      deliveryMode: 'SAAS',
      purchaseEnabled: product.purchaseEnabled ?? true,
      licenseRequired: false,
      saasAppCode: product.saasAppCode ?? 'MUVEKKIL_KASA_SAAS',
      saasPlanCode: product.saasPlanCode ?? 'PRO',
      saasRequiresLogin: product.saasRequiresLogin ?? true,
    };
  }

  const isFree =
    product.downloadFiles?.publicFreeDownload === true ||
    (product.price === 0 && !product.licenseRequired && !product.licenseAppCode);

  if (isFree) {
    return {
      productKind: 'SOFTWARE',
      deliveryMode: 'FREE_DOWNLOAD',
      purchaseEnabled: false,
      licenseRequired: false,
      saasAppCode: null,
      saasPlanCode: null,
      saasRequiresLogin: false,
    };
  }

  const isLicensed =
    product.licenseRequired === true || Boolean(product.licenseAppCode);

  if (isLicensed) {
    return {
      productKind: 'SOFTWARE',
      deliveryMode: 'LICENSED_DOWNLOAD',
      purchaseEnabled: product.purchaseEnabled ?? true,
      licenseRequired: true,
      saasAppCode: null,
      saasPlanCode: null,
      saasRequiresLogin: false,
    };
  }

  return {
    productKind: 'SOFTWARE',
    deliveryMode: 'PAID_DOWNLOAD',
    purchaseEnabled: product.purchaseEnabled ?? true,
    licenseRequired: false,
    saasAppCode: null,
    saasPlanCode: null,
    saasRequiresLogin: false,
  };
}

export function mapLegacyProductStatus(isActive = true): ProductStatus {
  return isActive ? 'ACTIVE' : 'DRAFT';
}

export function buildCanonicalUrl(slug: string): string {
  return `/yazilimlar/${slug}`;
}

export function countWords(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

export function isWeakHtml(html: string | null | undefined, minWords = 80): boolean {
  if (!html?.trim()) return true;
  return countWords(html) < minWords;
}

export function normalizeDownloadFiles(
  raw: LegacyProduct['downloadFiles'],
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (!raw?.files?.length) return Prisma.JsonNull;

  return {
    version: raw.version ?? null,
    publicFreeDownload: raw.publicFreeDownload ?? false,
    showAfterPaymentOnly: raw.showAfterPaymentOnly ?? true,
    files: raw.files.map((file) => ({
      label: file.label,
      type: file.type ?? 'other',
      version: file.version ?? null,
      size: file.size ?? null,
      buttonLabel: file.buttonLabel ?? file.label,
      storageProvider: file.storageProvider ?? (file.storageKey ? 'R2' : undefined),
      storageKey: file.storageKey ?? null,
      mediaAssetId: file.mediaAssetId ?? null,
    })),
  };
}
