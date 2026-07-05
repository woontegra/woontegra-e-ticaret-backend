import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/index.js';
import { buildPublicMediaUrl } from '../media-url.js';
import {
  buildDownloadStorageKey,
  buildWebsiteMediaPath,
  sanitizeFileName,
  sanitizeFolder,
} from './file-utils.js';
import type {
  StorageDeleteInput,
  StorageUploadInput,
  StorageUploadResult,
} from './storage.types.js';

function getStorageRoot(): string {
  return path.resolve(env.STORAGE_LOCAL_PATH);
}

export async function ensureLocalStorageRoot(): Promise<void> {
  await fs.mkdir(getStorageRoot(), { recursive: true });
}

async function writeLocalFile(storageKey: string, buffer: Buffer): Promise<void> {
  const filePath = path.join(getStorageRoot(), storageKey);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
}

export async function uploadLocalImage(
  input: StorageUploadInput,
): Promise<StorageUploadResult> {
  const fileName = sanitizeFileName(input.originalName);
  const folder = sanitizeFolder(input.folder);
  const storageKey = buildWebsiteMediaPath(folder, fileName);

  await writeLocalFile(storageKey, input.buffer);

  const url = buildPublicMediaUrl(storageKey);

  return {
    storageProvider: 'LOCAL',
    storageKey,
    bucket: null,
    url,
    publicUrl: url,
    size: input.buffer.length,
    mimeType: input.mimeType,
    fileName,
  };
}

export async function uploadLocalDownload(
  input: StorageUploadInput,
): Promise<StorageUploadResult> {
  const fileName = sanitizeFileName(input.originalName);
  const folder = sanitizeFolder(input.folder || 'products');
  const storageKey = buildDownloadStorageKey(folder, fileName);

  await writeLocalFile(storageKey, input.buffer);

  return {
    storageProvider: 'LOCAL',
    storageKey,
    bucket: null,
    url: null,
    publicUrl: null,
    size: input.buffer.length,
    mimeType: input.mimeType,
    fileName,
  };
}

export async function deleteLocalFile(input: StorageDeleteInput): Promise<void> {
  const filePath = path.join(getStorageRoot(), input.storageKey);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}
