/**
 * Medya modülü gelene kadar URL çözümlemesi yapılmaz.
 * Public tarafta logoUrl null ise siteName metin logosu kullanılır.
 */
export function resolveMediaUrl(mediaId: string | null | undefined): string | null {
  if (!mediaId) return null;
  return null;
}
