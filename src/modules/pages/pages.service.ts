import type { Prisma } from '@prisma/client';
import { PageStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toPageDto, toPageDtos } from '../../lib/page.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { slugify } from '../../lib/slug.js';
import type {
  CreatePageInput,
  ListPagesQuery,
  UpdatePageInput,
} from './pages.schema.js';

function buildWhere(query: ListPagesQuery): Prisma.PageWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.pageType ? { pageType: query.pageType } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
            { excerpt: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

export async function listPages(query: ListPagesQuery) {
  const where = buildWhere(query);

  const [items, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
    }),
    prisma.page.count({ where }),
  ]);

  return {
    items: await toPageDtos(items),
    total,
  };
}

export async function getPageById(id: string) {
  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) {
    throw AppError.notFound('Page not found');
  }

  return toPageDto(page);
}

export async function getPublishedPageBySlug(slug: string) {
  const page = await prisma.page.findFirst({
    where: { slug, status: PageStatus.PUBLISHED },
  });

  if (!page) {
    throw AppError.notFound('Page not found');
  }

  return toPageDto(page);
}

async function resolveUniqueSlug(title: string, slug?: string, excludeId?: string) {
  const base = slugify(slug ?? title);
  let candidate = base || 'sayfa';
  let suffix = 0;

  while (true) {
    const existing = await prisma.page.findFirst({
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

export async function createPage(input: CreatePageInput, userId?: string) {
  const slug = await resolveUniqueSlug(input.title, input.slug);

  try {
    const page = await prisma.page.create({
      data: {
        title: input.title,
        slug,
        status: input.status ?? PageStatus.DRAFT,
        pageType: input.pageType ?? 'STANDARD',
        excerpt: input.excerpt ?? null,
        contentHtml: input.contentHtml ?? '',
        blocksJson: input.blocksJson ?? undefined,
        featuredImageId: input.featuredImageId ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        ogImageId: input.ogImageId ?? null,
        canonicalUrl: input.canonicalUrl ?? null,
        robotsIndex: input.robotsIndex ?? true,
        publishedAt:
          input.status === PageStatus.PUBLISHED ? new Date() : null,
        createdById: userId ?? null,
        updatedById: userId ?? null,
      },
    });

    return toPageDto(page);
  } catch {
    throw AppError.conflict('Slug already exists');
  }
}

export async function updatePage(
  id: string,
  input: UpdatePageInput,
  userId?: string,
) {
  const existing = await prisma.page.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Page not found');
  }

  let slug: string | undefined;
  if (input.slug !== undefined) {
    slug = await resolveUniqueSlug(
      input.title ?? existing.title,
      input.slug,
      id,
    );
  } else if (input.title !== undefined && input.title !== existing.title) {
    // title changed without explicit slug — keep slug unless empty conflict
    slug = existing.slug;
  }

  const nextStatus = input.status ?? existing.status;
  let publishedAt = existing.publishedAt;

  if (nextStatus === PageStatus.PUBLISHED && !existing.publishedAt) {
    publishedAt = new Date();
  }

  if (nextStatus === PageStatus.DRAFT) {
    publishedAt = null;
  }

  try {
    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.pageType !== undefined ? { pageType: input.pageType } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.contentHtml !== undefined
          ? { contentHtml: input.contentHtml }
          : {}),
        ...(input.blocksJson !== undefined
          ? { blocksJson: input.blocksJson ?? undefined }
          : {}),
        ...(input.featuredImageId !== undefined
          ? { featuredImageId: input.featuredImageId }
          : {}),
        ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
        ...(input.seoDescription !== undefined
          ? { seoDescription: input.seoDescription }
          : {}),
        ...(input.ogImageId !== undefined ? { ogImageId: input.ogImageId } : {}),
        ...(input.canonicalUrl !== undefined
          ? { canonicalUrl: input.canonicalUrl }
          : {}),
        ...(input.robotsIndex !== undefined
          ? { robotsIndex: input.robotsIndex }
          : {}),
        publishedAt,
        updatedById: userId ?? null,
      },
    });

    return toPageDto(page);
  } catch {
    throw AppError.conflict('Slug already exists');
  }
}

export async function deletePage(id: string) {
  const existing = await prisma.page.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Page not found');
  }

  await prisma.page.delete({ where: { id } });
}

export async function publishPage(id: string, userId?: string) {
  const existing = await prisma.page.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Page not found');
  }

  const page = await prisma.page.update({
    where: { id },
    data: {
      status: PageStatus.PUBLISHED,
      publishedAt: existing.publishedAt ?? new Date(),
      updatedById: userId ?? null,
    },
  });

  return toPageDto(page);
}

export async function unpublishPage(id: string, userId?: string) {
  const existing = await prisma.page.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Page not found');
  }

  const page = await prisma.page.update({
    where: { id },
    data: {
      status: PageStatus.DRAFT,
      publishedAt: null,
      updatedById: userId ?? null,
    },
  });

  return toPageDto(page);
}
