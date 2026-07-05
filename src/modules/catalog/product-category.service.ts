import { AppError } from '../../lib/app-error.js';
import {
  toProductCategoryDto,
  toProductCategoryDtoWithUrls,
} from '../../lib/product.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { slugify } from '../../lib/slug.js';
import type {
  CreateProductCategoryInput,
  ListProductCategoriesQuery,
  UpdateProductCategoryInput,
} from './product-category.schema.js';
import { resolvePagination } from '../../lib/pagination.js';

async function resolveUniqueCategorySlug(
  name: string,
  slug?: string,
  excludeId?: string,
) {
  const base = slugify(slug ?? name);
  let candidate = base || 'kategori';
  let suffix = 0;

  while (true) {
    const existing = await prisma.productCategory.findFirst({
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

export async function listProductCategories(query: ListProductCategoriesQuery = {}) {
  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { slug: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const { skip, limit } = resolvePagination(query);

  const [categories, total] = await Promise.all([
    prisma.productCategory.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.productCategory.count({ where }),
  ]);

  return {
    items: await Promise.all(categories.map(toProductCategoryDtoWithUrls)),
    total,
  };
}

export async function getProductCategoryById(id: string) {
  const category = await prisma.productCategory.findUnique({ where: { id } });

  if (!category) {
    throw AppError.notFound('Product category not found');
  }

  return toProductCategoryDtoWithUrls(category);
}

export async function createProductCategory(input: CreateProductCategoryInput) {
  const slug = await resolveUniqueCategorySlug(input.name, input.slug);

  const category = await prisma.productCategory.create({
    data: {
      parentId: input.parentId ?? null,
      name: input.name,
      slug,
      description: input.description ?? null,
      imageId: input.imageId ?? null,
      bannerImageId: input.bannerImageId ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });

  return toProductCategoryDtoWithUrls(category);
}

export async function updateProductCategory(
  id: string,
  input: UpdateProductCategoryInput,
) {
  const existing = await prisma.productCategory.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Product category not found');
  }

  if (input.parentId === id) {
    throw AppError.badRequest('Category cannot be its own parent');
  }

  const slug =
    input.slug !== undefined || input.name !== undefined
      ? await resolveUniqueCategorySlug(
          input.name ?? existing.name,
          input.slug ?? existing.slug,
          id,
        )
      : undefined;

  const category = await prisma.productCategory.update({
    where: { id },
    data: {
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.imageId !== undefined ? { imageId: input.imageId } : {}),
      ...(input.bannerImageId !== undefined
        ? { bannerImageId: input.bannerImageId }
        : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined
        ? { seoDescription: input.seoDescription }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toProductCategoryDtoWithUrls(category);
}

export async function deleteProductCategory(id: string) {
  const existing = await prisma.productCategory.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Product category not found');
  }

  const childCount = await prisma.productCategory.count({
    where: { parentId: id },
  });

  if (childCount > 0) {
    throw AppError.badRequest('Remove child categories first');
  }

  await prisma.productCategory.delete({ where: { id } });
}

export async function listPublicProductCategories(
  query: { parent?: string; limit?: number },
) {
  const categories = await prisma.productCategory.findMany({
    where: {
      isActive: true,
      ...(query.parent
        ? { parent: { slug: query.parent, isActive: true } }
        : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take: query.limit,
  });

  const counts = await Promise.all(
    categories.map((category) =>
      prisma.product.count({
        where: { categoryId: category.id, status: 'ACTIVE' },
      }),
    ),
  );

  const { toPublicProductCategoryDto } = await import(
    '../../lib/product.mapper.js'
  );

  return Promise.all(
    categories.map((category, index) =>
      toPublicProductCategoryDto(category, counts[index]),
    ),
  );
}

export async function getPublicProductCategoryBySlug(slug: string) {
  const category = await prisma.productCategory.findFirst({
    where: { slug, isActive: true },
  });

  if (!category) {
    throw AppError.notFound('Category not found');
  }

  const productCount = await prisma.product.count({
    where: { categoryId: category.id, status: 'ACTIVE' },
  });

  const { toPublicProductCategoryDetailDto } = await import(
    '../../lib/product.mapper.js'
  );

  return toPublicProductCategoryDetailDto(category, productCount);
}

export { toProductCategoryDto };
