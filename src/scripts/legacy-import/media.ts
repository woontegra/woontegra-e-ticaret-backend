import { createHash } from 'node:crypto';
import type { MediaUsageType, StorageProvider } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { ImportReport } from './types.js';

function inferStorageProvider(url: string): StorageProvider | null {
  if (url.includes('blob.vercel-storage.com')) return 'VERCEL_BLOB';
  if (url.includes('.r2.dev') || url.includes('r2.cloudflarestorage.com')) {
    return 'R2';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return 'R2';
  return null;
}

function storageKeyFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, '') || url;
  } catch {
    return url;
  }
}

function fileNameFromUrl(url: string): string {
  const key = storageKeyFromUrl(url);
  const parts = key.split('/');
  return parts[parts.length - 1] || key;
}

export async function ensureMediaAssetFromUrl(
  url: string,
  options: {
    usageType: MediaUsageType;
    folder: string;
    altText?: string;
    report: ImportReport;
  },
): Promise<string | null> {
  const provider = inferStorageProvider(url);
  if (!provider) return null;

  const storageKey = storageKeyFromUrl(url);
  const existing = await prisma.mediaAsset.findUnique({ where: { storageKey } });
  if (existing) return existing.id;

  const fileName = fileNameFromUrl(url);
  const asset = await prisma.mediaAsset.create({
    data: {
      fileName,
      originalName: fileName,
      mimeType: guessMimeType(fileName),
      size: 0,
      storageProvider: provider,
      usageType: options.usageType,
      storageKey,
      url,
      publicUrl: url,
      folder: options.folder,
      altText: options.altText ?? null,
    },
  });

  if (provider === 'VERCEL_BLOB') {
    options.report.media.blobLinked.push(`${fileName} → ${url}`);
  } else {
    options.report.media.r2Linked.push(`${fileName} → ${storageKey}`);
  }

  return asset.id;
}

export function trackLocalImagePath(
  path: string,
  context: string,
  report: ImportReport,
): void {
  report.media.localPathNeedsManualUpload.push(`${context}: ${path}`);
}

function guessMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.exe')) return 'application/octet-stream';
  if (lower.endsWith('.zip')) return 'application/zip';
  return 'application/octet-stream';
}

export function hashStorageKey(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 32);
}
