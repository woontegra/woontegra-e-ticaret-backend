import type { Prisma } from '@prisma/client';
import { PageStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  estimateReadingTime,
  toBlogPostDto,
  toBlogPostDtos,
} from '../../lib/blog.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { slugify } from '../../lib/slug.js';
import type {
  CreateBlogPostInput,
  ListBlogPostsQuery,
  PublicBlogPostsQuery,
  UpdateBlogPostInput,
} from './blog-post.schema.js';

const postInclude = { category: true } as const;

async function resolveUniquePostSlug(
  title: string,
  slug?: string,
  excludeId?: string,
) {
  const base = slugify(slug ?? title);
  let candidate = base || 'yazi';
  let suffix = 0;

  while (true) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

function buildPostWhere(
  query: ListBlogPostsQuery | PublicBlogPostsQuery,
  publishedOnly = false,
): Prisma.BlogPostWhereInput {
  const categorySlug =
    'category' in query && query.category ? query.category : undefined;

  return {
    ...(publishedOnly ? { status: PageStatus.PUBLISHED } : {}),
    ...('status' in query && query.status ? { status: query.status } : {}),
    ...('categoryId' in query && query.categoryId
      ? { categoryId: query.categoryId }
      : {}),
    ...(categorySlug
      ? { category: { slug: categorySlug, isActive: true } }
      : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
            { excerpt: { contains: query.search, mode: 'insensitive' } },
            { authorName: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

export async function listBlogPosts(query: ListBlogPostsQuery) {
  const where = buildPostWhere(query);

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: postInclude,
      orderBy: [{ updatedAt: 'desc' }],
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { items: await toBlogPostDtos(items), total };
}

export async function listPublicBlogPosts(query: PublicBlogPostsQuery) {
  const where = buildPostWhere(query, true);
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: postInclude,
      orderBy: [{ publishedAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    items: await toBlogPostDtos(items),
    total,
    page,
    limit,
  };
}

export async function getBlogPostById(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: postInclude,
  });

  if (!post) {
    throw AppError.notFound('Blog post not found');
  }

  return toBlogPostDto(post);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: PageStatus.PUBLISHED },
    include: postInclude,
  });

  if (!post) {
    throw AppError.notFound('Blog post not found');
  }

  return toBlogPostDto(post);
}

export async function createBlogPost(
  input: CreateBlogPostInput,
  userId?: string,
) {
  const slug = await resolveUniquePostSlug(input.title, input.slug);
  const readingTime =
    input.readingTime ??
    (input.contentHtml ? estimateReadingTime(input.contentHtml) : null);

  try {
    const post = await prisma.blogPost.create({
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt ?? null,
        contentHtml: input.contentHtml ?? '',
        coverImageId: input.coverImageId ?? null,
        categoryId: input.categoryId ?? null,
        status: input.status ?? PageStatus.DRAFT,
        authorName: input.authorName ?? null,
        readingTime,
        tags: input.tags ?? [],
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        ogImageId: input.ogImageId ?? null,
        robotsIndex: input.robotsIndex ?? true,
        publishedAt:
          input.status === PageStatus.PUBLISHED ? new Date() : null,
        createdById: userId ?? null,
        updatedById: userId ?? null,
      },
      include: postInclude,
    });

    return toBlogPostDto(post);
  } catch {
    throw AppError.conflict('Post slug already exists');
  }
}

export async function updateBlogPost(
  id: string,
  input: UpdateBlogPostInput,
  userId?: string,
) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Blog post not found');
  }

  const slug =
    input.slug !== undefined
      ? await resolveUniquePostSlug(
          input.title ?? existing.title,
          input.slug,
          id,
        )
      : undefined;

  const nextStatus = input.status ?? existing.status;
  let publishedAt = existing.publishedAt;

  if (nextStatus === PageStatus.PUBLISHED && !existing.publishedAt) {
    publishedAt = new Date();
  }

  if (nextStatus === PageStatus.DRAFT) {
    publishedAt = null;
  }

  const contentHtml =
    input.contentHtml !== undefined ? input.contentHtml : existing.contentHtml;
  const readingTime =
    input.readingTime !== undefined
      ? input.readingTime
      : input.contentHtml !== undefined
        ? estimateReadingTime(contentHtml)
        : existing.readingTime;

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.contentHtml !== undefined
          ? { contentHtml: input.contentHtml }
          : {}),
        ...(input.coverImageId !== undefined
          ? { coverImageId: input.coverImageId }
          : {}),
        ...(input.categoryId !== undefined
          ? { categoryId: input.categoryId }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.authorName !== undefined
          ? { authorName: input.authorName }
          : {}),
        readingTime,
        ...(input.tags !== undefined ? { tags: input.tags } : {}),
        ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
        ...(input.seoDescription !== undefined
          ? { seoDescription: input.seoDescription }
          : {}),
        ...(input.ogImageId !== undefined ? { ogImageId: input.ogImageId } : {}),
        ...(input.robotsIndex !== undefined
          ? { robotsIndex: input.robotsIndex }
          : {}),
        publishedAt,
        updatedById: userId ?? null,
      },
      include: postInclude,
    });

    return toBlogPostDto(post);
  } catch {
    throw AppError.conflict('Post slug already exists');
  }
}

export async function deleteBlogPost(id: string) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Blog post not found');
  }

  await prisma.blogPost.delete({ where: { id } });
}

export async function publishBlogPost(id: string, userId?: string) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Blog post not found');
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      status: PageStatus.PUBLISHED,
      publishedAt: existing.publishedAt ?? new Date(),
      updatedById: userId ?? null,
    },
    include: postInclude,
  });

  return toBlogPostDto(post);
}

export async function unpublishBlogPost(id: string, userId?: string) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Blog post not found');
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      status: PageStatus.DRAFT,
      publishedAt: null,
      updatedById: userId ?? null,
    },
    include: postInclude,
  });

  return toBlogPostDto(post);
}
