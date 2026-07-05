import path from 'node:path';

const WEBSITE_MEDIA_FOLDERS = new Set([
  'logo',
  'hero',
  'blog',
  'products',
  'builder',
  'campaigns',
  'general',
  'branding',
]);

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const ALLOWED_DOCUMENT_MIMES = new Set([
  'application/pdf',
  'video/mp4',
  'video/webm',
]);

const ALLOWED_DOWNLOAD_MIMES = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/x-msdownload',
  'application/octet-stream',
  'application/vnd.microsoft.portable-executable',
  'application/x-msi',
]);

const ALLOWED_DOWNLOAD_EXTENSIONS = new Set([
  '.exe',
  '.zip',
  '.msi',
  '.7z',
  '.rar',
  '.dmg',
]);

export function sanitizeFolder(folder: string): string {
  const normalized = folder
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '-');
  return normalized.replace(/^\/+|\/+$/g, '') || 'general';
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

export function normalizeWebsiteMediaFolder(folder?: string | null): string {
  const raw = sanitizeFolder(folder ?? 'general').split('/')[0] ?? 'general';
  if (WEBSITE_MEDIA_FOLDERS.has(raw)) return raw;
  return 'general';
}

export function buildWebsiteMediaPath(folder: string, fileName: string): string {
  const safeFolder = normalizeWebsiteMediaFolder(folder);
  const safeName = path.basename(fileName.replace(/\\/g, '/'));
  return `website-media/${safeFolder}/${safeName}`;
}

export function buildDownloadStorageKey(folder: string, fileName: string): string {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const safeFolder = sanitizeFolder(folder || 'products');
  const safeName = path.basename(fileName.replace(/\\/g, '/'));
  return `downloads/${safeFolder}/${yyyy}/${mm}/${safeName}`;
}

export function isImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIMES.has(mimeType.toLowerCase());
}

export function isDocumentMimeType(mimeType: string): boolean {
  return ALLOWED_DOCUMENT_MIMES.has(mimeType.toLowerCase());
}

export function isDownloadMimeType(mimeType: string, originalName: string): boolean {
  const mime = mimeType.toLowerCase();
  if (ALLOWED_DOWNLOAD_MIMES.has(mime)) return true;
  const ext = path.extname(originalName).toLowerCase();
  return ALLOWED_DOWNLOAD_EXTENSIONS.has(ext);
}

export function inferMimeType(fileName: string, fallback = 'application/octet-stream'): string {
  const ext = path.extname(fileName).replace(/^\./, '').toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    zip: 'application/zip',
    exe: 'application/x-msdownload',
    msi: 'application/x-msi',
  };
  return map[ext] ?? fallback;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function resolveUsageTypeForImage(
  usageType?: string | null,
): import('@prisma/client').MediaUsageType {
  const normalized = (usageType ?? 'IMAGE').toUpperCase().replace(/-/g, '_');
  const allowed = new Set([
    'IMAGE',
    'LOGO',
    'FAVICON',
    'HERO_IMAGE',
    'PRODUCT_IMAGE',
    'BLOG_IMAGE',
    'BUILDER_IMAGE',
    'CAMPAIGN_IMAGE',
    'DOCUMENT',
  ]);
  if (allowed.has(normalized)) {
    return normalized as import('@prisma/client').MediaUsageType;
  }
  return 'IMAGE';
}
