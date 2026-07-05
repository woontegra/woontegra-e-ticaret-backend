import type { ProductDownloadFilesConfig } from './product-download-files.js';
import { parseDownloadFiles } from './product-download-files.js';

export interface PublicDownloadFileDto {
  label: string;
  type?: 'setup' | 'portable' | 'other';
  buttonLabel?: string;
  version?: string;
  size?: string;
  available?: boolean;
}

export interface PublicDownloadFilesDto {
  version?: string;
  publicFreeDownload?: boolean;
  files?: PublicDownloadFileDto[];
}

export function toPublicDownloadFiles(
  raw: unknown,
): PublicDownloadFilesDto | null {
  const config = parseDownloadFiles(raw);
  if (!config?.files?.length) return null;

  return {
    version: config.version ?? undefined,
    publicFreeDownload: config.publicFreeDownload,
    files: config.files.map((file) => ({
      label: file.label,
      type: file.type ?? undefined,
      buttonLabel: file.buttonLabel ?? undefined,
      version: file.version ?? undefined,
      size: file.size ?? undefined,
      available: Boolean(file.mediaAssetId?.trim()),
    })),
  };
}

export function hasPublicDownloadFiles(
  config: PublicDownloadFilesDto | null | undefined,
): boolean {
  return Boolean(config?.files?.length);
}
