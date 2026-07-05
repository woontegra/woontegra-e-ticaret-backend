import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/index.js';
import { sanitizeFolder } from '../../lib/storage/file-utils.js';

function getStorageRoot(): string {
  return path.resolve(env.STORAGE_LOCAL_PATH);
}

export async function ensureStorageRoot(): Promise<void> {
  await fs.mkdir(getStorageRoot(), { recursive: true });
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
