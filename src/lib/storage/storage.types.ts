import type { MediaUsageType, StorageProvider } from '@prisma/client';

export type { MediaUsageType, StorageProvider };

export const IMAGE_USAGE_TYPES: MediaUsageType[] = [
  'IMAGE',
  'LOGO',
  'FAVICON',
  'HERO_IMAGE',
  'PRODUCT_IMAGE',
  'BLOG_IMAGE',
  'BUILDER_IMAGE',
  'CAMPAIGN_IMAGE',
];

export interface StorageUploadInput {
  buffer: Buffer;
  fileName: string;
  originalName: string;
  mimeType: string;
  folder: string;
  usageType: MediaUsageType;
}

export interface StorageUploadResult {
  storageProvider: StorageProvider;
  storageKey: string;
  bucket: string | null;
  url: string | null;
  publicUrl: string | null;
  size: number;
  mimeType: string;
  fileName: string;
}

export interface StorageDeleteInput {
  storageProvider: StorageProvider;
  storageKey: string;
  bucket: string | null;
}
