import { ProductAttributeType } from '@prisma/client';
import { z } from 'zod';
import { slugify } from '../../lib/slug.js';

const codeSchema = z
  .string()
  .min(1)
  .max(80)
  .transform((value) => slugify(value).replace(/-/g, '_'));

export const createProductAttributeSchema = z.object({
  name: z.string().min(1).max(120),
  code: codeSchema.optional(),
  type: z.nativeEnum(ProductAttributeType),
  isFilterable: z.boolean().optional(),
  isVariantOption: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateProductAttributeSchema = createProductAttributeSchema.partial();

export const createProductAttributeValueSchema = z.object({
  value: z.string().min(1).max(120),
  colorHex: z.string().max(20).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateProductAttributeValueSchema =
  createProductAttributeValueSchema.partial();

export type CreateProductAttributeInput = z.infer<
  typeof createProductAttributeSchema
>;
export type UpdateProductAttributeInput = z.infer<
  typeof updateProductAttributeSchema
>;
export type CreateProductAttributeValueInput = z.infer<
  typeof createProductAttributeValueSchema
>;
export type UpdateProductAttributeValueInput = z.infer<
  typeof updateProductAttributeValueSchema
>;
