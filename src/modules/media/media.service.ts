import { AppError } from '../../lib/app-error.js';
import { buildPublicMediaUrl } from '../../lib/media-url.js';
import { toMediaAssetDto } from '../../lib/media.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/index.js';
import {
  buildStorageKey,
  deleteStoredFile,
  sanitizeFolder,
} from '../../services/storage/local-storage.driver.js';
import type { ListMediaQuery, UpdateMediaInput } from './media.schema.js';
import type { Prisma } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';

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

export async function listMedia(query: ListMediaQuery) {
  const where: Prisma.MediaAssetWhereInput = {
    ...(query.folder ? { folder: sanitizeFolder(query.folder) } : {}),
    ...(buildTypeFilter(query.type) ?? {}),
    ...(query.search
      ? {
          OR: [
            { originalName: { contains: query.search, mode: 'insensitive' } },
            { fileName: { contains: query.search, mode: 'insensitive' } },
            { title: { contains: query.search, mode: 'insensitive' } },
            { altText: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
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
  usageType?: string;
  createdById?: string;
}

export async function uploadMedia(input: UploadMediaInput) {
  const folder = sanitizeFolder(input.folder ?? 'general');
  const fileName = input.file.filename;
  const storageKey = buildStorageKey(folder, fileName);
  const url = buildPublicMediaUrl(storageKey);

  const asset = await prisma.mediaAsset.create({
    data: {
      fileName,
      originalName: input.file.originalname,
      mimeType: input.file.mimetype,
      size: input.file.size,
      url,
      storageKey,
      folder,
      usageType: input.usageType ?? null,
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

  let storageKey = existing.storageKey;
  let url = existing.url;
  let folder = existing.folder;

  if (input.folder && sanitizeFolder(input.folder) !== existing.folder) {
    folder = sanitizeFolder(input.folder);
    storageKey = buildStorageKey(folder, existing.fileName);
    url = buildPublicMediaUrl(storageKey);

    const root = path.resolve(env.STORAGE_LOCAL_PATH);
    const oldPath = path.join(root, existing.storageKey);
    const newPath = path.join(root, storageKey);
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.rename(oldPath, newPath);
  }

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: {
      altText: input.altText,
      title: input.title,
      usageType: input.usageType,
      folder,
      storageKey,
      url,
    },
  });

  return toMediaAssetDto(asset);
}

export async function deleteMedia(id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });

  if (!asset) {
    throw AppError.notFound('Media asset not found');
  }

  await deleteStoredFile(asset.storageKey);
  await prisma.mediaAsset.delete({ where: { id } });
}
