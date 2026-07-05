import { env } from '../config/index.js';

/** Public storefront URL (https://magaza.com) — SEO, sitemap, CORS */
export function resolvePublicSiteUrl(
  seoCanonical?: string | null,
  siteDomain?: string | null,
): string {
  const fromPanel =
    seoCanonical?.trim().replace(/\/$/, '') ||
    siteDomain?.trim().replace(/\/$/, '') ||
    '';

  if (fromPanel) return fromPanel;

  return env.PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
}

/** Base URL for uploaded media (https://api.example.com/media) */
export function resolveStoragePublicBaseUrl(): string | undefined {
  if (env.STORAGE_PUBLIC_BASE_URL) {
    return env.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, '');
  }

  if (env.API_PUBLIC_URL) {
    return `${env.API_PUBLIC_URL.replace(/\/$/, '')}/media`;
  }

  return undefined;
}
