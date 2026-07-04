import type { MediaAsset } from '@prisma/client';
import type { MediaAssetDto } from '../types/api.js';

export function toMediaAssetDto(asset: MediaAsset): MediaAssetDto {
  return {
    id: asset.id,
    fileName: asset.fileName,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    url: asset.url,
    storageKey: asset.storageKey,
    folder: asset.folder,
    altText: asset.altText,
    title: asset.title,
    usageType: asset.usageType,
    createdById: asset.createdById,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}
