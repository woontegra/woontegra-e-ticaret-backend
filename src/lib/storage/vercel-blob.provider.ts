import { del, put } from '@vercel/blob';
import { env } from '../../config/index.js';
import {
  buildWebsiteMediaPath,
  sanitizeFileName,
  sanitizeFolder,
} from './file-utils.js';
import type {
  StorageDeleteInput,
  StorageUploadInput,
  StorageUploadResult,
} from './storage.types.js';

export function isVercelBlobConfigured(): boolean {
  return Boolean(
    env.BLOB_READ_WRITE_TOKEN?.trim() || env.VERCEL_BLOB_READ_WRITE_TOKEN?.trim(),
  );
}

function readBlobToken(): string {
  const token =
    env.BLOB_READ_WRITE_TOKEN?.trim() ||
    env.VERCEL_BLOB_READ_WRITE_TOKEN?.trim() ||
    '';
  if (!token) {
    throw new Error('Vercel Blob token not configured');
  }
  return token;
}

export async function uploadVercelBlobImage(
  input: StorageUploadInput,
): Promise<StorageUploadResult> {
  const fileName = sanitizeFileName(input.originalName);
  const folder = sanitizeFolder(input.folder);
  const pathname = buildWebsiteMediaPath(folder, fileName);
  const token = readBlobToken();

  const blob = await put(pathname, input.buffer, {
    access: 'public',
    token,
    contentType: input.mimeType || 'application/octet-stream',
    addRandomSuffix: false,
  });

  return {
    storageProvider: 'VERCEL_BLOB',
    storageKey: blob.pathname,
    bucket: 'vercel-blob',
    url: blob.url,
    publicUrl: blob.url,
    size: input.buffer.length,
    mimeType: input.mimeType,
    fileName,
  };
}

export async function deleteVercelBlobFile(
  input: StorageDeleteInput,
): Promise<void> {
  if (!input.storageKey?.trim()) return;
  const token = readBlobToken();
  await del(input.storageKey, { token });
}
