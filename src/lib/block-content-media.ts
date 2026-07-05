import { resolveMediaUrlMap } from './media-url.js';

const MEDIA_ID_URL_PAIRS: Array<[idKey: string, urlKey: string]> = [
  ['imageMediaId', 'imageUrl'],
  ['mobileImageMediaId', 'mobileImageUrl'],
  ['backgroundImageMediaId', 'backgroundImageUrl'],
  ['backgroundImageId', 'backgroundImageUrl'],
  ['desktopImageId', 'imageUrl'],
  ['mobileImageId', 'mobileImageUrl'],
];

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function collectMediaIdsFromObject(value: unknown, ids: Set<string>): void {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMediaIdsFromObject(item, ids);
    }
    return;
  }

  const record = value as Record<string, unknown>;

  for (const [idKey] of MEDIA_ID_URL_PAIRS) {
    const id = getString(record[idKey]);
    if (id) ids.add(id);
  }

  for (const nested of Object.values(record)) {
    if (nested && typeof nested === 'object') {
      collectMediaIdsFromObject(nested, ids);
    }
  }
}

export function collectBlockMediaIds(
  content: Record<string, unknown>,
  settings: Record<string, unknown>,
): string[] {
  const ids = new Set<string>();
  collectMediaIdsFromObject(content, ids);
  collectMediaIdsFromObject(settings, ids);
  return [...ids];
}

function hydrateObject(value: unknown, urlMap: Map<string, string>): unknown {
  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map((item) => hydrateObject(item, urlMap));
  }

  const record = { ...(value as Record<string, unknown>) };

  for (const [idKey, urlKey] of MEDIA_ID_URL_PAIRS) {
    const mediaId = getString(record[idKey]);
    if (!mediaId) continue;

    const resolved = urlMap.get(mediaId);
    if (resolved) {
      record[urlKey] = resolved;
    }
  }

  for (const [key, nested] of Object.entries(record)) {
    if (nested && typeof nested === 'object') {
      record[key] = hydrateObject(nested, urlMap);
    }
  }

  return record;
}

export async function hydrateBlocksMediaFields<
  T extends { content: Record<string, unknown>; settings: Record<string, unknown> },
>(blocks: T[]): Promise<T[]> {
  const allIds = new Set<string>();
  for (const block of blocks) {
    for (const id of collectBlockMediaIds(block.content, block.settings)) {
      allIds.add(id);
    }
  }

  const urlMap = await resolveMediaUrlMap([...allIds]);

  return blocks.map((block) => ({
    ...block,
    content: hydrateObject(block.content, urlMap) as Record<string, unknown>,
    settings: hydrateObject(block.settings, urlMap) as Record<string, unknown>,
  }));
}

export async function hydrateBlockMediaFields(
  content: Record<string, unknown>,
  settings: Record<string, unknown>,
): Promise<{ content: Record<string, unknown>; settings: Record<string, unknown> }> {
  const [block] = await hydrateBlocksMediaFields([{ content, settings }]);
  return { content: block!.content, settings: block!.settings };
}
