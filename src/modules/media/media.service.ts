import type { MediaUsageType, Prisma } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toMediaAssetDto } from '../../lib/media.mapper.js';
import {
  formatFileSize,
  inferMimeType,
  isDownloadMimeType,
  isImageMimeType,
  resolveUsageTypeForImage,
  sanitizeFolder,
} from '../../lib/storage/file-utils.js';
import {
  deleteStoredAsset,
  uploadDownloadAsset,
  uploadImageAsset,
} from '../../lib/storage/storage.service.js';
import { prisma } from '../../lib/prisma.js';
import type { ListMediaQuery, UpdateMediaInput } from './media.schema.js';
import { resolvePagination } from '../../lib/pagination.js';
import { IMAGE_USAGE_TYPES } from '../../lib/storage/storage.types.js';

function buildTypeFilter(type?: ListMediaQuery['type']): Prisma.MediaAssetWhereInput | undefined {
  if (!type) return undefined;

  if (type === 'other') {
    return {
      NOT: [
        { mimeType: { startsWith: 'image/' } },
        { mimeType: { startsWith: 'video/' } },
        { mimeType: { startsWith: 'audio/' } },
        { mimeType: { startsWith: 'application/' } },
      ],
    };
  }

  const prefixMap: Record<Exclude<ListMediaQuery['type'], 'other' | undefined>, string> = {
    image: 'image/',
    video: 'video/',
    audio: 'audio/',
    document: 'application/',
  };

  return { mimeType: { startsWith: prefixMap[type] } };
}

function buildLibraryFilter(
  library?: ListMediaQuery['library'],
): Prisma.MediaAssetWhereInput | undefined {
  if (!library || library === 'all') return undefined;

  if (library === 'downloads') {
    return { usageType: 'DOWNLOAD_BINARY' };
  }

  if (library === 'documents') {
    return { usageType: 'DOCUMENT' };
  }

  if (library === 'images') {
    return {
      OR: [
        { usageType: { in: IMAGE_USAGE_TYPES } },
        {
          AND: [
            { usageType: null },
            { mimeType: { startsWith: 'image/' } },
          ],
        },
      ],
      NOT: { usageType: 'DOWNLOAD_BINARY' },
    };
  }

  return undefined;
}

export async function listMedia(query: ListMediaQuery) {
  const where: Prisma.MediaAssetWhereInput = {
    ...(query.folder ? { folder: sanitizeFolder(query.folder) } : {}),
    ...(query.usageType ? { usageType: query.usageType } : {}),
    ...(query.storageProvider ? { storageProvider: query.storageProvider } : {}),
    ...(buildLibraryFilter(query.library) ?? {}),
    ...(buildTypeFilter(query.type) ?? {}),
    ...(query.search
      ? {
          OR: [
            { originalName: { contains: query.search, mode: 'insensitive' } },
            { fileName: { contains: query.search, mode: 'insensitive' } },
            { title: { contains: query.search, mode: 'insensitive' } },
            { altText: { contains: query.search, mode: 'insensitive' } },
            { storageKey: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const { skip, limit } = resolvePagination(query, { defaultLimit: 40 });

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  return {
    items: items.map(toMediaAssetDto),
    total,
  };
}

export async function listMediaFolders() {
  const rows = await prisma.mediaAsset.findMany({
    distinct: ['folder'],
    select: { folder: true },
    orderBy: { folder: 'asc' },
  });

  return rows.map((row) => row.folder);
}

export async function getMediaById(id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });

  if (!asset) {
    throw AppError.notFound('Media asset not found');
  }

  return toMediaAssetDto(asset);
}

interface UploadMediaInput {
  file: Express.Multer.File;
  folder?: string;
  usageType?: MediaUsageType;
  createdById?: string;
}

export async function uploadMedia(input: UploadMediaInput) {
  const folder = sanitizeFolder(input.folder ?? 'general');
  const usageType = resolveUsageTypeForImage(input.usageType);
  const mimeType =
    input.file.mimetype || inferMimeType(input.file.originalname);

  if (!isImageMimeType(mimeType) && usageType !== 'DOCUMENT') {
    throw AppError.badRequest('Only image uploads are allowed on this endpoint');
  }

  const uploaded = await uploadImageAsset({
    buffer: input.file.buffer,
    fileName: input.file.originalname,
    originalName: input.file.originalname,
    mimeType,
    folder,
    usageType,
  });

  const asset = await prisma.mediaAsset.create({
    data: {
      fileName: uploaded.fileName,
      originalName: input.file.originalname,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      storageProvider: uploaded.storageProvider,
      usageType,
      bucket: uploaded.bucket,
      storageKey: uploaded.storageKey,
      url: uploaded.url,
      publicUrl: uploaded.publicUrl,
      folder,
      createdById: input.createdById ?? null,
    },
  });

  return toMediaAssetDto(asset);
}

export async function uploadDownloadMedia(input: UploadMediaInput) {
  const folder = sanitizeFolder(input.folder ?? 'products');
  const mimeType =
    input.file.mimetype || inferMimeType(input.file.originalname);

  if (!isDownloadMimeType(mimeType, input.file.originalname)) {
    throw AppError.badRequest(
      'Unsupported download file type. Allowed: exe, zip, msi, 7z, rar',
    );
  }

  const uploaded = await uploadDownloadAsset({
    buffer: input.file.buffer,
    fileName: input.file.originalname,
    originalName: input.file.originalname,
    mimeType,
    folder,
    usageType: 'DOWNLOAD_BINARY',
  });

  const asset = await prisma.mediaAsset.create({
    data: {
      fileName: uploaded.fileName,
      originalName: input.file.originalname,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      storageProvider: uploaded.storageProvider,
      usageType: 'DOWNLOAD_BINARY',
      bucket: uploaded.bucket,
      storageKey: uploaded.storageKey,
      url: uploaded.url,
      publicUrl: uploaded.publicUrl,
      folder,
      createdById: input.createdById ?? null,
    },
  });

  return toMediaAssetDto(asset);
}

export async function updateMedia(id: string, input: UpdateMediaInput) {
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Media asset not found');
  }

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: {
      altText: input.altText,
      title: input.title,
      usageType: input.usageType ?? undefined,
      folder: input.folder ? sanitizeFolder(input.folder) : undefined,
    },
  });

  return toMediaAssetDto(asset);
}

export async function deleteMedia(id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });

  if (!asset) {
    throw AppError.notFound('Media asset not found');
  }

  await deleteStoredAsset({
    storageProvider: asset.storageProvider,
    storageKey: asset.storageKey,
    bucket: asset.bucket,
  });
  await prisma.mediaAsset.delete({ where: { id } });
}

export { formatFileSize };
