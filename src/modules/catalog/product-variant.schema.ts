import { z } from 'zod';

const assignmentSchema = z.object({
  attributeId: z.string().min(1),
  valueText: z.string().nullable().optional(),
  valueNumber: z.number().nullable().optional(),
  valueBoolean: z.boolean().nullable().optional(),
  attributeValueId: z.string().nullable().optional(),
});

export const saveProductAttributeAssignmentsSchema = z.object({
  assignments: z.array(assignmentSchema),
});

export const variantOptionInputSchema = z.object({
  attributeId: z.string().min(1),
  attributeValueId: z.string().min(1),
});

export const createProductVariantSchema = z.object({
  sku: z.string().max(80).nullable().optional(),
  barcode: z.string().max(80).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  salePrice: z.number().nonnegative().nullable().optional(),
  stockQuantity: z.number().int().nullable().optional(),
  imageId: z.string().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  options: z.array(variantOptionInputSchema).min(1),
});

export const updateProductVariantSchema = createProductVariantSchema
  .partial()
  .extend({
    options: z.array(variantOptionInputSchema).min(1).optional(),
  });

export const generateProductVariantsSchema = z.object({
  selections: z
    .array(
      z.object({
        attributeId: z.string().min(1),
        valueIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
});

export type SaveProductAttributeAssignmentsInput = z.infer<
  typeof saveProductAttributeAssignmentsSchema
>;
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;
export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantSchema
>;
export type GenerateProductVariantsInput = z.infer<
  typeof generateProductVariantsSchema
>;
