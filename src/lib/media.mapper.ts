import type { MediaAsset } from '@prisma/client';
import type { MediaAssetDto } from '../types/api.js';

function effectiveMediaUrl(asset: MediaAsset): string | null {
  if (asset.usageType === 'DOWNLOAD_BINARY' && asset.storageProvider === 'R2') {
    return null;
  }
  return asset.publicUrl ?? asset.url ?? null;
}

export function toMediaAssetDto(asset: MediaAsset): MediaAssetDto {
  const url = effectiveMediaUrl(asset);

  return {
    id: asset.id,
    fileName: asset.fileName,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    storageProvider: asset.storageProvider,
    usageType: asset.usageType,
    bucket: asset.bucket,
    storageKey: asset.storageKey,
    url: url ?? '',
    publicUrl: asset.publicUrl,
    folder: asset.folder,
    altText: asset.altText,
    title: asset.title,
    createdById: asset.createdById,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}
