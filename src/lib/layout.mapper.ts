import type { PageBlock, PageLayout } from '@prisma/client';
import type {
  PageBlockDto,
  PageLayoutDto,
  PublicHomeLayoutDto,
  PublicPageBlockDto,
} from '../types/api.js';

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

export function toPublicPageBlockDto(block: PageBlock): PublicPageBlockDto {
  return {
    id: block.id,
    type: block.type,
    title: block.title,
    settings: parseJsonObject(block.settings),
    content: parseJsonObject(block.content),
  };
}

export function toPublicHomeLayoutDto(
  layout: PageLayout,
  blocks: PageBlock[],
): PublicHomeLayoutDto {
  return {
    id: layout.id,
    name: layout.name,
    layoutType: layout.layoutType,
    publishedAt: layout.publishedAt?.toISOString() ?? null,
    blocks: blocks.map(toPublicPageBlockDto),
  };
}
