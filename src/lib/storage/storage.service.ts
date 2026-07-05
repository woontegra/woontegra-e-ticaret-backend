import type { MediaUsageType, StorageProvider } from '@prisma/client';
import { env } from '../../config/index.js';
import { IMAGE_USAGE_TYPES } from './storage.types.js';
import type {
  StorageDeleteInput,
  StorageUploadInput,
  StorageUploadResult,
} from './storage.types.js';
import {
  deleteLocalFile,
  uploadLocalDownload,
  uploadLocalImage,
} from './local-storage.provider.js';
import {
  deleteR2File,
  isR2Configured,
  uploadR2Download,
} from './r2.provider.js';
import {
  deleteVercelBlobFile,
  isVercelBlobConfigured,
  uploadVercelBlobImage,
} from './vercel-blob.provider.js';

export function resolveImageStorageProvider(): StorageProvider {
  if (
    env.IMAGE_STORAGE_DRIVER === 'vercel_blob' &&
    isVercelBlobConfigured()
  ) {
    return 'VERCEL_BLOB';
  }
  if (env.NODE_ENV === 'development' || env.STORAGE_DRIVER === 'local') {
    return 'LOCAL';
  }
  if (isVercelBlobConfigured()) {
    return 'VERCEL_BLOB';
  }
  return 'LOCAL';
}

export function resolveDownloadStorageProvider(): StorageProvider {
  if (env.DOWNLOAD_STORAGE_DRIVER === 'r2' && isR2Configured()) {
    return 'R2';
  }
  if (env.NODE_ENV === 'development' || env.STORAGE_DRIVER === 'local') {
    return 'LOCAL';
  }
  if (isR2Configured()) {
    return 'R2';
  }
  return 'LOCAL';
}

export function isImageUsageType(usageType: MediaUsageType | null | undefined): boolean {
  if (!usageType) return true;
  return IMAGE_USAGE_TYPES.includes(usageType);
}

export async function uploadImageAsset(
  input: StorageUploadInput,
): Promise<StorageUploadResult> {
  const provider = resolveImageStorageProvider();

  if (provider === 'VERCEL_BLOB') {
    return uploadVercelBlobImage(input);
  }

  return uploadLocalImage(input);
}

export async function uploadDownloadAsset(
  input: StorageUploadInput,
): Promise<StorageUploadResult> {
  const provider = resolveDownloadStorageProvider();

  if (provider === 'R2') {
    return uploadR2Download(input);
  }

  return uploadLocalDownload(input);
}

export async function deleteStoredAsset(input: StorageDeleteInput): Promise<void> {
  switch (input.storageProvider) {
    case 'VERCEL_BLOB':
      await deleteVercelBlobFile(input);
      return;
    case 'R2':
      await deleteR2File(input);
      return;
    default:
      await deleteLocalFile(input);
  }
}
