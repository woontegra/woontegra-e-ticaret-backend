import type { PageBlock, PageLayout } from '@prisma/client';
import type {
  PageBlockDto,
  PageLayoutDto,
  PublicHomeLayoutDto,
  PublicPageBlockDto,
} from '../types/api.js';
import { hydrateBlocksMediaFields } from './block-content-media.js';

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export function toPageBlockDto(block: PageBlock): PageBlockDto {
  return {
    id: block.id,
    layoutId: block.layoutId,
    type: block.type,
    title: block.title,
    settings: parseJsonObject(block.settings),
    content: parseJsonObject(block.content),
    sortOrder: block.sortOrder,
    isActive: block.isActive,
    createdAt: block.createdAt.toISOString(),
    updatedAt: block.updatedAt.toISOString(),
  };
}

export function toPageLayoutDto(
  layout: PageLayout,
  blocks?: PageBlockDto[],
): PageLayoutDto {
  return {
    id: layout.id,
    pageId: layout.pageId,
    layoutType: layout.layoutType,
    name: layout.name,
    status: layout.status,
    publishedAt: layout.publishedAt?.toISOString() ?? null,
    ...(blocks ? { blocks } : {}),
    createdAt: layout.createdAt.toISOString(),
    updatedAt: layout.updatedAt.toISOString(),
  };
}

export async function toPublicPageBlockDto(
  block: Pick<PageBlock, 'id' | 'type' | 'title' | 'settings' | 'content'>,
): Promise<PublicPageBlockDto> {
  const content = parseJsonObject(block.content);
  const settings = parseJsonObject(block.settings);
  const [hydrated] = await hydrateBlocksMediaFields([
    { ...block, content, settings },
  ]);

  return {
    id: block.id,
    type: block.type,
    title: block.title,
    settings: hydrated!.settings,
    content: hydrated!.content,
  };
}

export async function toPublicHomeLayoutDto(
  layout: Pick<
    PageLayout,
    'id' | 'name' | 'layoutType' | 'publishedAt'
  >,
  blocks: Pick<
    PageBlock,
    'id' | 'type' | 'title' | 'settings' | 'content'
  >[],
): Promise<PublicHomeLayoutDto> {
  const parsedBlocks = blocks.map((block) => ({
    id: block.id,
    type: block.type,
    title: block.title,
    content: parseJsonObject(block.content),
    settings: parseJsonObject(block.settings),
  }));

  const hydratedBlocks = await hydrateBlocksMediaFields(parsedBlocks);

  return {
    id: layout.id,
    name: layout.name,
    layoutType: layout.layoutType,
    publishedAt: layout.publishedAt?.toISOString() ?? null,
    blocks: hydratedBlocks.map((block) => ({
      id: block.id,
      type: block.type,
      title: block.title,
      settings: block.settings,
      content: block.content,
    })),
  };
}
