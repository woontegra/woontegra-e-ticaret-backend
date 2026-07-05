import type { Brand, Product, ProductCategory, Prisma } from '@prisma/client';
import type {
  BrandDto,
  ProductCategoryDto,
  ProductDto,
  PublicBrandSummaryDto,
  PublicProductCategoryDetailDto,
  PublicProductCategoryDto,
  PublicProductDetailDto,
  PublicProductDto,
} from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function toProductCategoryDto(
  category: ProductCategory,
): ProductCategoryDto {
  return {
    id: category.id,
    parentId: category.parentId,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageId: category.imageId,
    bannerImageId: category.bannerImageId,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export async function toProductCategoryDtoWithUrls(
  category: ProductCategory,
): Promise<ProductCategoryDto> {
  const urlMap = await resolveMediaUrlMap([
    category.imageId,
    category.bannerImageId,
  ]);

  return {
    ...toProductCategoryDto(category),
    imageUrl: category.imageId ? (urlMap.get(category.imageId) ?? null) : null,
    bannerImageUrl: category.bannerImageId
      ? (urlMap.get(category.bannerImageId) ?? null)
      : null,
  };
}

export function toBrandDto(brand: Brand): BrandDto {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoId: brand.logoId,
    description: brand.description,
    seoTitle: brand.seoTitle,
    seoDescription: brand.seoDescription,
    isActive: brand.isActive,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  };
}

export async function toBrandDtoWithUrls(brand: Brand): Promise<BrandDto> {
  const urlMap = await resolveMediaUrlMap([brand.logoId]);

  return {
    ...toBrandDto(brand),
    logoUrl: brand.logoId ? (urlMap.get(brand.logoId) ?? null) : null,
  };
}

type ProductWithRelations = Product & {
  category?: ProductCategory | null;
  brand?: Brand | null;
};

export async function toProductDto(
  product: ProductWithRelations,
): Promise<ProductDto> {
  const galleryIds = parseStringArray(product.galleryImageIds);
  const urlMap = await resolveMediaUrlMap([
    product.mainImageId,
    product.ogImageId,
    ...galleryIds,
    product.brand?.logoId,
    product.category?.imageId,
  ]);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    barcode: product.barcode,
    productKind: product.productKind,
    shortDescription: product.shortDescription,
    descriptionHtml: product.descriptionHtml,
    categoryId: product.categoryId,
    category: product.category
      ? {
          ...toProductCategoryDto(product.category),
          imageUrl: product.category.imageId
            ? (urlMap.get(product.category.imageId) ?? null)
            : null,
        }
      : null,
    brandId: product.brandId,
    brand: product.brand
      ? {
          ...toBrandDto(product.brand),
          logoUrl: product.brand.logoId
            ? (urlMap.get(product.brand.logoId) ?? null)
            : null,
        }
      : null,
    status: product.status,
    basePrice: decimalToNumber(product.basePrice),
    salePrice: decimalToNumber(product.salePrice),
    taxRate: decimalToNumber(product.taxRate),
    stockTrackingEnabled: product.stockTrackingEnabled,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    mainImageId: product.mainImageId,
    mainImageUrl: product.mainImageId
      ? (urlMap.get(product.mainImageId) ?? null)
      : null,
    galleryImageIds: galleryIds,
    galleryImageUrls: galleryIds
      .map((id) => urlMap.get(id) ?? null)
      .filter((url): url is string => Boolean(url)),
    tags: parseStringArray(product.tags),
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    demoUrl: product.demoUrl,
    purchaseUrl: product.purchaseUrl,
    downloadUrl: product.downloadUrl,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    ogImageId: product.ogImageId,
    ogImageUrl: product.ogImageId
      ? (urlMap.get(product.ogImageId) ?? null)
      : null,
    canonicalUrl: product.canonicalUrl,
    robotsIndex: product.robotsIndex,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function toProductDtos(
  products: ProductWithRelations[],
): Promise<ProductDto[]> {
  const galleryIds = products.flatMap((product) =>
    parseStringArray(product.galleryImageIds),
  );
  const urlMap = await resolveMediaUrlMap(
    products.flatMap((product) => [
      product.mainImageId,
      product.ogImageId,
      product.brand?.logoId,
      product.category?.imageId,
      ...parseStringArray(product.galleryImageIds),
    ]),
  );

  return products.map((product) => {
    const gallery = parseStringArray(product.galleryImageIds);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode,
      productKind: product.productKind,
      shortDescription: product.shortDescription,
      descriptionHtml: product.descriptionHtml,
      categoryId: product.categoryId,
      category: product.category
        ? {
            ...toProductCategoryDto(product.category),
            imageUrl: product.category.imageId
              ? (urlMap.get(product.category.imageId) ?? null)
              : null,
          }
        : null,
      brandId: product.brandId,
      brand: product.brand
        ? {
            ...toBrandDto(product.brand),
            logoUrl: product.brand.logoId
              ? (urlMap.get(product.brand.logoId) ?? null)
              : null,
          }
        : null,
      status: product.status,
      basePrice: decimalToNumber(product.basePrice),
      salePrice: decimalToNumber(product.salePrice),
      taxRate: decimalToNumber(product.taxRate),
      stockTrackingEnabled: product.stockTrackingEnabled,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      mainImageId: product.mainImageId,
      mainImageUrl: product.mainImageId
        ? (urlMap.get(product.mainImageId) ?? null)
        : null,
      galleryImageIds: gallery,
      galleryImageUrls: gallery
        .map((id) => urlMap.get(id) ?? null)
        .filter((url): url is string => Boolean(url)),
      tags: parseStringArray(product.tags),
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      demoUrl: product.demoUrl,
      purchaseUrl: product.purchaseUrl,
      downloadUrl: product.downloadUrl,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      ogImageId: product.ogImageId,
      ogImageUrl: product.ogImageId
        ? (urlMap.get(product.ogImageId) ?? null)
        : null,
      canonicalUrl: product.canonicalUrl,
      robotsIndex: product.robotsIndex,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  });
}

function getDisplayPrice(product: Product): number | null {
  return decimalToNumber(product.salePrice) ?? decimalToNumber(product.basePrice);
}

export async function toPublicProductDto(
  product: ProductWithRelations,
): Promise<PublicProductDto> {
  const urlMap = await resolveMediaUrlMap([
    product.mainImageId,
    product.brand?.logoId,
  ]);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    productKind: product.productKind,
    price: getDisplayPrice(product),
    basePrice: decimalToNumber(product.basePrice),
    salePrice: decimalToNumber(product.salePrice),
    imageUrl: product.mainImageId
      ? (urlMap.get(product.mainImageId) ?? null)
      : null,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    demoUrl: product.demoUrl,
    purchaseUrl: product.purchaseUrl,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
          logoUrl: product.brand.logoId
            ? (urlMap.get(product.brand.logoId) ?? null)
            : null,
          description: product.brand.description,
        }
      : null,
  };
}

export async function toPublicProductDtos(
  products: ProductWithRelations[],
): Promise<PublicProductDto[]> {
  const urlMap = await resolveMediaUrlMap(
    products.flatMap((product) => [product.mainImageId, product.brand?.logoId]),
  );

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    productKind: product.productKind,
    price: getDisplayPrice(product),
    basePrice: decimalToNumber(product.basePrice),
    salePrice: decimalToNumber(product.salePrice),
    imageUrl: product.mainImageId
      ? (urlMap.get(product.mainImageId) ?? null)
      : null,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    demoUrl: product.demoUrl,
    purchaseUrl: product.purchaseUrl,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
          logoUrl: product.brand.logoId
            ? (urlMap.get(product.brand.logoId) ?? null)
            : null,
          description: product.brand.description,
        }
      : null,
  }));
}

export async function toPublicProductDetailDto(
  product: ProductWithRelations,
): Promise<PublicProductDetailDto> {
  const base = await toPublicProductDto(product);
  const galleryIds = parseStringArray(product.galleryImageIds);
  const urlMap = await resolveMediaUrlMap([
    product.ogImageId,
    ...galleryIds,
  ]);

  return {
    ...base,
    descriptionHtml: product.descriptionHtml,
    galleryImageUrls: galleryIds
      .map((id) => urlMap.get(id) ?? null)
      .filter((url): url is string => Boolean(url)),
    tags: parseStringArray(product.tags),
    demoUrl: product.demoUrl,
    purchaseUrl: product.purchaseUrl,
    downloadUrl: product.downloadUrl,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    ogImageUrl: product.ogImageId
      ? (urlMap.get(product.ogImageId) ?? null)
      : null,
    canonicalUrl: product.canonicalUrl,
    robotsIndex: product.robotsIndex,
    attributes: [],
    variantAttributes: [],
    variants: [],
  };
}

export async function toPublicProductCategoryDto(
  category: ProductCategory,
  productCount?: number,
): Promise<PublicProductCategoryDto> {
  const urlMap = await resolveMediaUrlMap([
    category.imageId,
    category.bannerImageId,
  ]);

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageId ? (urlMap.get(category.imageId) ?? null) : null,
    bannerImageUrl: category.bannerImageId
      ? (urlMap.get(category.bannerImageId) ?? null)
      : null,
    productCount,
  };
}

export async function toPublicProductCategoryDetailDto(
  category: ProductCategory,
  productCount: number,
): Promise<PublicProductCategoryDetailDto> {
  const base = await toPublicProductCategoryDto(category, productCount);

  return {
    ...base,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
  };
}

export function toPublicBrandSummaryDto(
  brand: Brand,
  logoUrl: string | null,
): PublicBrandSummaryDto {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl,
    description: brand.description,
  };
}
