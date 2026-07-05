import { env } from '../config/index.js';
import { resolveStoragePublicBaseUrl } from './public-url.js';
import { prisma } from './prisma.js';

export function buildPublicMediaUrl(storageKey: string): string {
  const base = resolveStoragePublicBaseUrl();

  if (!base) {
    throw new Error(
      'Media URL not configured. Set STORAGE_PUBLIC_BASE_URL or API_PUBLIC_URL.',
    );
  }

  const normalizedKey = storageKey.replace(/^\/+/, '');
  return `${base}/${normalizedKey}`;
}

export async function resolveMediaUrl(
  mediaId: string | null | undefined,
): Promise<string | null> {
  if (!mediaId) return null;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    select: { url: true, publicUrl: true, usageType: true, storageProvider: true },
  });

  if (!asset) return null;
  if (asset.usageType === 'DOWNLOAD_BINARY' && asset.storageProvider === 'R2') {
    return null;
  }

  return asset.publicUrl ?? asset.url ?? null;
}

export async function resolveMediaUrlMap(
  mediaIds: Array<string | null | undefined>,
): Promise<Map<string, string>> {
  const ids = [...new Set(mediaIds.filter(Boolean) as string[])];
  const map = new Map<string, string>();

  if (ids.length === 0) return map;

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      url: true,
      publicUrl: true,
      usageType: true,
      storageProvider: true,
    },
  });

  for (const asset of assets) {
    if (asset.usageType === 'DOWNLOAD_BINARY' && asset.storageProvider === 'R2') {
      continue;
    }
    const resolved = asset.publicUrl ?? asset.url;
    if (resolved) {
      map.set(asset.id, resolved);
    }
  }

  return map;
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/** Warn once at startup when media URLs cannot be resolved. */
export function assertMediaUrlConfig(): void {
  if (env.STORAGE_DRIVER !== 'local') return;
  if (!resolveStoragePublicBaseUrl()) {
    console.warn(
      '[config] STORAGE_PUBLIC_BASE_URL or API_PUBLIC_URL not set — uploaded media URLs will fail until configured.',
    );
  }
}
