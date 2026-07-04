import { env } from '../config/index.js';
import { prisma } from './prisma.js';

export function buildPublicMediaUrl(storageKey: string): string {
  const base = env.STORAGE_PUBLIC_BASE_URL;

  if (!base) {
    throw new Error('STORAGE_PUBLIC_BASE_URL is not configured');
  }

  const normalizedKey = storageKey.replace(/^\/+/, '');
  return `${base.replace(/\/$/, '')}/${normalizedKey}`;
}

export async function resolveMediaUrl(
  mediaId: string | null | undefined,
): Promise<string | null> {
  if (!mediaId) return null;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    select: { url: true },
  });

  return asset?.url ?? null;
}

export async function resolveMediaUrlMap(
  mediaIds: Array<string | null | undefined>,
): Promise<Map<string, string>> {
  const ids = [...new Set(mediaIds.filter(Boolean) as string[])];
  const map = new Map<string, string>();

  if (ids.length === 0) return map;

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: ids } },
    select: { id: true, url: true },
  });

  for (const asset of assets) {
    map.set(asset.id, asset.url);
  }

  return map;
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}
