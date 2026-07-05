import { createHash, randomBytes } from 'node:crypto';
import { env } from '../config/index.js';

export function hashDownloadToken(rawToken: string): string {
  const pepper = env.DOWNLOAD_TOKEN_SECRET?.trim() || env.JWT_SECRET;
  return createHash('sha256').update(`${pepper}:${rawToken}`).digest('hex');
}

export function generateRawDownloadToken(): string {
  return randomBytes(32).toString('base64url');
}

export function getDownloadTokenExpiryDate(): Date {
  const days = env.DOWNLOAD_TOKEN_DAYS;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires;
}

export function resolveDownloadApiBaseUrl(): string {
  const api = env.API_PUBLIC_URL?.replace(/\/$/, '');
  if (api) return `${api}/api/downloads`;
  if (env.NODE_ENV === 'development') {
    return `http://localhost:${env.PORT}/api/downloads`;
  }
  throw new Error('API_PUBLIC_URL is required for download links');
}

export function buildPaidDownloadPath(rawToken: string): string {
  return `/api/downloads/order/${encodeURIComponent(rawToken)}`;
}

export function buildFreeDownloadPath(
  productSlug: string,
  fileType: string,
): string {
  return `/api/downloads/free/${encodeURIComponent(productSlug)}/${encodeURIComponent(fileType)}`;
}

export function buildPaidDownloadUrl(rawToken: string): string {
  return `${resolveDownloadApiBaseUrl()}/order/${encodeURIComponent(rawToken)}`;
}

export function buildFreeDownloadUrl(
  productSlug: string,
  fileType: string,
): string {
  return `${resolveDownloadApiBaseUrl()}/free/${encodeURIComponent(productSlug)}/${encodeURIComponent(fileType)}`;
}
