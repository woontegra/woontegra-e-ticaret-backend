import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/index.js';

function getStorageRoot(): string {
  return path.resolve(env.STORAGE_LOCAL_PATH);
}

export async function ensureStorageRoot(): Promise<void> {
  await fs.mkdir(getStorageRoot(), { recursive: true });
}

export async function ensureFolder(folder: string): Promise<string> {
  const safeFolder = sanitizeFolder(folder);
  const dir = path.join(getStorageRoot(), safeFolder);
  await fs.mkdir(dir, { recursive: true });
  return safeFolder;
}

export function sanitizeFolder(folder: string): string {
  const normalized = folder.trim().toLowerCase().replace(/[^a-z0-9/_-]/g, '-');
  return normalized.replace(/^\/+|\/+$/g, '') || 'general';
}

export function buildStorageKey(folder: string, fileName: string): string {
  return `${sanitizeFolder(folder)}/${fileName}`;
}

export async function deleteStoredFile(storageKey: string): Promise<void> {
  const filePath = path.join(getStorageRoot(), storageKey);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export function sanitizeFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

  return `${Date.now()}-${base || 'file'}${ext}`;
}
