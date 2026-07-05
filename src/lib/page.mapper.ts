import type { Page } from '@prisma/client';
import type { PageDto } from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

export async function toPageDto(page: Page): Promise<PageDto> {
  const urlMap = await resolveMediaUrlMap([
    page.featuredImageId,
    page.ogImageId,
  ]);

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    pageType: page.pageType,
    excerpt: page.excerpt,
    contentHtml: page.contentHtml,
    blocksJson: page.blocksJson,
    featuredImageId: page.featuredImageId,
    featuredImageUrl: page.featuredImageId
      ? (urlMap.get(page.featuredImageId) ?? null)
      : null,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    ogImageId: page.ogImageId,
    ogImageUrl: page.ogImageId ? (urlMap.get(page.ogImageId) ?? null) : null,
    canonicalUrl: page.canonicalUrl,
    robotsIndex: page.robotsIndex,
    publishedAt: page.publishedAt?.toISOString() ?? null,
    createdById: page.createdById,
    updatedById: page.updatedById,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  };
}

export async function toPageDtos(pages: Page[]): Promise<PageDto[]> {
  const urlMap = await resolveMediaUrlMap(
    pages.flatMap((page) => [page.featuredImageId, page.ogImageId]),
  );

  return pages.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    pageType: page.pageType,
    excerpt: page.excerpt,
    contentHtml: page.contentHtml,
    blocksJson: page.blocksJson,
    featuredImageId: page.featuredImageId,
    featuredImageUrl: page.featuredImageId
      ? (urlMap.get(page.featuredImageId) ?? null)
      : null,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    ogImageId: page.ogImageId,
    ogImageUrl: page.ogImageId ? (urlMap.get(page.ogImageId) ?? null) : null,
    canonicalUrl: page.canonicalUrl,
    robotsIndex: page.robotsIndex,
    publishedAt: page.publishedAt?.toISOString() ?? null,
    createdById: page.createdById,
    updatedById: page.updatedById,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  }));
}
