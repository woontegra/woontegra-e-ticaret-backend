import { z } from 'zod';
import { isValidSlug, slugify } from '../../lib/slug.js';
import { paginationQuerySchema } from '../../lib/pagination.js';

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .transform((value) => slugify(value))
  .refine((value) => isValidSlug(value), { message: 'Invalid slug format' });

const optionalMediaId = z.string().min(1).nullable().optional();

export const createBrandSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
  logoId: optionalMediaId,
  description: z.string().max(2000).nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export const listBrandsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type ListBrandsQuery = z.infer<typeof listBrandsQuerySchema>;
