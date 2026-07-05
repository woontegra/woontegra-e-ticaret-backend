import type { BlogCategory, BlogPost } from '@prisma/client';
import type { BlogCategoryDto, BlogPostDto } from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

function parseTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag): tag is string => typeof tag === 'string');
}

export function toBlogCategoryDto(category: BlogCategory): BlogCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export async function toBlogPostDto(
  post: BlogPost & { category?: BlogCategory | null },
): Promise<BlogPostDto> {
  const urlMap = await resolveMediaUrlMap([post.coverImageId, post.ogImageId]);

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    coverImageId: post.coverImageId,
    coverImageUrl: post.coverImageId
      ? (urlMap.get(post.coverImageId) ?? null)
      : null,
    categoryId: post.categoryId,
    category: post.category ? toBlogCategoryDto(post.category) : null,
    status: post.status,
    authorName: post.authorName,
    readingTime: post.readingTime,
    tags: parseTags(post.tags),
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    ogImageId: post.ogImageId,
    ogImageUrl: post.ogImageId ? (urlMap.get(post.ogImageId) ?? null) : null,
    robotsIndex: post.robotsIndex,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdById: post.createdById,
    updatedById: post.updatedById,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function toBlogPostDtos(
  posts: Array<BlogPost & { category?: BlogCategory | null }>,
): Promise<BlogPostDto[]> {
  const urlMap = await resolveMediaUrlMap(
    posts.flatMap((post) => [post.coverImageId, post.ogImageId]),
  );

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    coverImageId: post.coverImageId,
    coverImageUrl: post.coverImageId
      ? (urlMap.get(post.coverImageId) ?? null)
      : null,
    categoryId: post.categoryId,
    category: post.category ? toBlogCategoryDto(post.category) : null,
    status: post.status,
    authorName: post.authorName,
    readingTime: post.readingTime,
    tags: parseTags(post.tags),
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    ogImageId: post.ogImageId,
    ogImageUrl: post.ogImageId ? (urlMap.get(post.ogImageId) ?? null) : null,
    robotsIndex: post.robotsIndex,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdById: post.createdById,
    updatedById: post.updatedById,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));
}

export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
