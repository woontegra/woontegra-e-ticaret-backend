export function buildTrackingUrl(
  template: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  if (!template?.trim() || !trackingNumber?.trim()) {
    return null;
  }

  const encoded = encodeURIComponent(trackingNumber.trim());

  return template
    .replace(/\{trackingNumber\}/gi, encoded)
    .replace(/\{tracking_number\}/gi, encoded);
}
