import type { Prisma } from '@prisma/client';
import { ProductStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toInputJson } from '../../lib/json.js';
import {
  buildPublicVariantAttributes,
  toPublicProductAttributeRowDto,
  toPublicProductVariantDto,
} from '../../lib/product-attribute.mapper.js';
import {
  toProductDto,
  toProductDtos,
  toPublicProductDetailDto,
  toPublicProductDtos,
} from '../../lib/product.mapper.js';
import { loadPublicProductAttributes } from './product-attribute.service.js';
import { loadPublicProductVariants } from './product-variant.service.js';
import { prisma } from '../../lib/prisma.js';
import { slugify } from '../../lib/slug.js';
import type {
  CreateProductInput,
  ListProductsQuery,
  PublicProductsQuery,
  UpdateProductInput,
} from './product.schema.js';

const productInclude = {
  category: true,
  brand: true,
} as const;

async function resolveUniqueProductSlug(
  name: string,
  slug?: string,
  excludeId?: string,
) {
  const base = slugify(slug ?? name);
  let candidate = base || 'urun';
  let suffix = 0;

  while (true) {
    const existing = await prisma.product.findFirst({
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

function buildPriceFilter(
  minPrice?: number,
  maxPrice?: number,
): Prisma.ProductWhereInput | undefined {
  if (minPrice === undefined && maxPrice === undefined) return undefined;

  const range = {
    ...(minPrice !== undefined ? { gte: minPrice } : {}),
    ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
  };

  return {
    OR: [
      { salePrice: { not: null, ...range } },
      { salePrice: null, basePrice: range },
    ],
  };
}

function buildAttributeFilter(
  attrValueIds?: string[],
): Prisma.ProductWhereInput | undefined {
  if (!attrValueIds?.length) return undefined;

  return {
    AND: attrValueIds.map((attributeValueId) => ({
      attributeAssignments: {
        some: { attributeValueId },
      },
    })),
  };
}

function buildPublicOrderBy(
  sort: PublicProductsQuery['sort'],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'price_asc':
      return [{ salePrice: 'asc' }, { basePrice: 'asc' }];
    case 'price_desc':
      return [{ salePrice: 'desc' }, { basePrice: 'desc' }];
    case 'featured':
    default:
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
  }
}

function buildProductWhere(
  query: ListProductsQuery | PublicProductsQuery,
  activeOnly = false,
): Prisma.ProductWhereInput {
  const categorySlug =
    'category' in query && query.category ? query.category : undefined;
  const brandSlug = 'brand' in query && query.brand ? query.brand : undefined;
  const publicQuery = query as PublicProductsQuery;
  const priceFilter = buildPriceFilter(publicQuery.minPrice, publicQuery.maxPrice);
  const attributeFilter = buildAttributeFilter(publicQuery.attrValues);
  const extraAnd: Prisma.ProductWhereInput[] = [];
  if (priceFilter) extraAnd.push(priceFilter);
  if (attributeFilter?.AND) {
    const clauses = Array.isArray(attributeFilter.AND)
      ? attributeFilter.AND
      : [attributeFilter.AND];
    extraAnd.push(...clauses);
  }

  return {
    ...(activeOnly ? { status: ProductStatus.ACTIVE } : {}),
    ...('status' in query && query.status ? { status: query.status } : {}),
    ...('categoryId' in query && query.categoryId
      ? { categoryId: query.categoryId }
      : {}),
    ...(categorySlug
      ? { category: { slug: categorySlug, isActive: true } }
      : {}),
    ...(brandSlug ? { brand: { slug: brandSlug, isActive: true } } : {}),
    ...('brandId' in query && query.brandId ? { brandId: query.brandId } : {}),
    ...('productKind' in query && query.productKind
      ? { productKind: query.productKind }
      : {}),
    ...('featured' in query && query.featured ? { isFeatured: true } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
            { sku: { contains: query.search, mode: 'insensitive' } },
            { shortDescription: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(extraAnd.length > 0 ? { AND: extraAnd } : {}),
  };
}

function mapProductData(input: CreateProductInput | UpdateProductInput) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.sku !== undefined ? { sku: input.sku } : {}),
    ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
    ...(input.productKind !== undefined ? { productKind: input.productKind } : {}),
    ...(input.shortDescription !== undefined
      ? { shortDescription: input.shortDescription }
      : {}),
    ...(input.descriptionHtml !== undefined
      ? { descriptionHtml: input.descriptionHtml }
      : {}),
    ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
    ...(input.brandId !== undefined ? { brandId: input.brandId } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.basePrice !== undefined
      ? { basePrice: input.basePrice }
      : {}),
    ...(input.salePrice !== undefined
      ? { salePrice: input.salePrice }
      : {}),
    ...(input.taxRate !== undefined ? { taxRate: input.taxRate } : {}),
    ...(input.stockTrackingEnabled !== undefined
      ? { stockTrackingEnabled: input.stockTrackingEnabled }
      : {}),
    ...(input.stockQuantity !== undefined
      ? { stockQuantity: input.stockQuantity }
      : {}),
    ...(input.lowStockThreshold !== undefined
      ? { lowStockThreshold: input.lowStockThreshold }
      : {}),
    ...(input.mainImageId !== undefined ? { mainImageId: input.mainImageId } : {}),
    ...(input.galleryImageIds !== undefined
      ? { galleryImageIds: toInputJson(input.galleryImageIds) }
      : {}),
    ...(input.tags !== undefined ? { tags: toInputJson(input.tags) } : {}),
    ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
    ...(input.isNew !== undefined ? { isNew: input.isNew } : {}),
    ...(input.isBestSeller !== undefined
      ? { isBestSeller: input.isBestSeller }
      : {}),
    ...(input.demoUrl !== undefined ? { demoUrl: input.demoUrl } : {}),
    ...(input.purchaseUrl !== undefined ? { purchaseUrl: input.purchaseUrl } : {}),
    ...(input.downloadUrl !== undefined ? { downloadUrl: input.downloadUrl } : {}),
    ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
    ...(input.seoDescription !== undefined
      ? { seoDescription: input.seoDescription }
      : {}),
    ...(input.ogImageId !== undefined ? { ogImageId: input.ogImageId } : {}),
    ...(input.canonicalUrl !== undefined
      ? { canonicalUrl: input.canonicalUrl }
      : {}),
    ...(input.robotsIndex !== undefined ? { robotsIndex: input.robotsIndex } : {}),
  };
}

export async function listProducts(query: ListProductsQuery) {
  const where = buildProductWhere(query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items: await toProductDtos(items), total };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!product) {
    throw AppError.notFound('Product not found');
  }

  return toProductDto(product);
}

export async function createProduct(input: CreateProductInput) {
  const slug = await resolveUniqueProductSlug(input.name, input.slug);

  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug,
        ...mapProductData(input),
      },
      include: productInclude,
    });

    return toProductDto(product);
  } catch {
    throw AppError.conflict('Product slug or SKU already exists');
  }
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  const slug =
    input.slug !== undefined || input.name !== undefined
      ? await resolveUniqueProductSlug(
          input.name ?? existing.name,
          input.slug ?? existing.slug,
          id,
        )
      : undefined;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(slug !== undefined ? { slug } : {}),
        ...mapProductData(input),
      },
      include: productInclude,
    });

    return toProductDto(product);
  } catch {
    throw AppError.conflict('Product slug or SKU already exists');
  }
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  await prisma.product.delete({ where: { id } });
}

export async function listPublicProducts(query: PublicProductsQuery) {
  const where = buildProductWhere(query, true);
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const skip = (page - 1) * limit;
  const orderBy = buildPublicOrderBy(query.sort);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items: await toPublicProductDtos(items), total };
}

export async function getPublicProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, status: ProductStatus.ACTIVE },
    include: productInclude,
  });

  if (!product) {
    throw AppError.notFound('Product not found');
  }

  const [assignments, variants] = await Promise.all([
    loadPublicProductAttributes(product.id),
    loadPublicProductVariants(product.id),
  ]);

  const base = await toPublicProductDetailDto(product);
  const publicVariants = await Promise.all(
    variants.map((variant) => toPublicProductVariantDto(variant)),
  );

  return {
    ...base,
    attributes: assignments.map(toPublicProductAttributeRowDto),
    variantAttributes: buildPublicVariantAttributes(variants),
    variants: publicVariants,
  };
}
