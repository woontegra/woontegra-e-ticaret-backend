import type { StorefrontUiLabels } from '../types/api.js';
import { DEFAULT_STOREFRONT_UI } from './default-storefront-ui.js';

export function parseStorefrontUi(value: unknown): StorefrontUiLabels {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const result: StorefrontUiLabels = {};

  for (const key of Object.keys(DEFAULT_STOREFRONT_UI) as Array<
    keyof StorefrontUiLabels
  >) {
    const val = record[key];
    if (typeof val === 'string' && val.trim()) {
      result[key] = val.trim();
    }
  }

  return result;
}

export function parseContactLabels(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const result: Record<string, string> = {};

  for (const [key, val] of Object.entries(record)) {
    if (typeof val === 'string' && val.trim()) {
      result[key] = val.trim();
    }
  }

  return result;
}
