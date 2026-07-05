import { z } from 'zod';
import { isValidSlug, slugify } from '../../lib/slug.js';

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .transform((value) => slugify(value))
  .refine((value) => isValidSlug(value), { message: 'Invalid slug format' });

const optionalMediaId = z.string().min(1).nullable().optional();

export const createProductCategorySchema = z.object({
  parentId: z.string().nullable().optional(),
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
  description: z.string().max(2000).nullable().optional(),
  imageId: optionalMediaId,
  bannerImageId: optionalMediaId,
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

export type CreateProductCategoryInput = z.infer<
  typeof createProductCategorySchema
>;
export type UpdateProductCategoryInput = z.infer<
  typeof updateProductCategorySchema
>;
