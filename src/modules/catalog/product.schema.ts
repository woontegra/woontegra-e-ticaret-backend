import { DeliveryMode, ProductKind, ProductStatus } from '@prisma/client';
import { z } from 'zod';
import { isValidSlug, slugify } from '../../lib/slug.js';
import { optionalSanitizedHtml } from '../../lib/html-sanitize.js';
import { productDownloadFilesSchema } from '../../lib/product-download-files.js';

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .transform((value) => slugify(value))
  .refine((value) => isValidSlug(value), { message: 'Invalid slug format' });

const optionalMediaId = z.string().min(1).nullable().optional();

const productFieldsSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  sku: z.string().max(80).nullable().optional(),
  barcode: z.string().max(80).nullable().optional(),
  productKind: z.nativeEnum(ProductKind).optional(),
  deliveryMode: z.nativeEnum(DeliveryMode).optional(),
  purchaseEnabled: z.boolean().optional(),
  currency: z.string().max(8).optional(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  version: z.string().max(50).nullable().optional(),
  featureBullets: z.array(z.string().max(200)).optional(),
  sortOrder: z.number().int().optional(),
  licenseRequired: z.boolean().optional(),
  licenseAppCode: z.string().max(80).nullable().optional(),
  licenseDays: z.number().int().positive().nullable().optional(),
  licenseMonths: z.number().int().positive().nullable().optional(),
  licenseMaxDevices: z.number().int().positive().nullable().optional(),
  saasAppCode: z.string().max(80).nullable().optional(),
  saasPlanCode: z.string().max(80).nullable().optional(),
  saasTrialDays: z.number().int().nonnegative().nullable().optional(),
  saasRequiresLogin: z.boolean().optional(),
  downloadFiles: productDownloadFilesSchema,
  shortDescription: z.string().max(500).nullable().optional(),
  descriptionHtml: z
    .string()
    .optional()
    .transform((value) => optionalSanitizedHtml(value)),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  basePrice: z.number().nonnegative().nullable().optional(),
  salePrice: z.number().nonnegative().nullable().optional(),
  taxRate: z.number().min(0).max(100).nullable().optional(),
  stockTrackingEnabled: z.boolean().optional(),
  stockQuantity: z.number().int().nullable().optional(),
  lowStockThreshold: z.number().int().nullable().optional(),
  mainImageId: optionalMediaId,
  galleryImageIds: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  demoUrl: z.string().max(500).nullable().optional(),
  purchaseUrl: z.string().max(500).nullable().optional(),
  downloadUrl: z.string().max(500).nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  ogImageId: optionalMediaId,
  canonicalUrl: z.string().max(500).nullable().optional(),
  robotsIndex: z.boolean().optional(),
});

export const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  productKind: z.nativeEnum(ProductKind).optional(),
  deliveryMode: z.nativeEnum(DeliveryMode).optional(),
  licenseRequired: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const publicProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  productKind: z.nativeEnum(ProductKind).optional(),
  featured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'featured'])
    .optional()
    .default('featured'),
  attrValues: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const raw = Array.isArray(value) ? value : value.split(',');
      const ids = raw.map((item) => item.trim()).filter(Boolean);
      return ids.length > 0 ? ids : undefined;
    }),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const publicCategoriesQuerySchema = z.object({
  parent: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const createProductSchema = productFieldsSchema;
export const updateProductSchema = productFieldsSchema.partial();

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type PublicProductsQuery = z.infer<typeof publicProductsQuerySchema>;
export type PublicCategoriesQuery = z.infer<typeof publicCategoriesQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
