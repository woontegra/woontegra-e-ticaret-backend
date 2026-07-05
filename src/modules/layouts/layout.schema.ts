import { z } from 'zod';

const blockTypeSchema = z.enum([
  'HERO',
  'HERO_SLIDER',
  'TEXT',
  'TEXT_IMAGE',
  'IMAGE_BANNER',
  'PRODUCT_GRID',
  'PRODUCT_CAROUSEL',
  'CATEGORY_GRID',
  'BLOG_GRID',
  'TRUST_BADGES',
  'FAQ',
  'CONTACT_FORM',
  'BRAND_LOGOS',
  'TESTIMONIALS',
  'NEWSLETTER',
  'CUSTOM_SPACER',
]);

export const updateHomeDraftSchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

export const createPageBlockSchema = z.object({
  type: blockTypeSchema,
  title: z.string().max(200).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
  content: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updatePageBlockSchema = z.object({
  type: blockTypeSchema.optional(),
  title: z.string().max(200).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
  content: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const reorderLayoutBlocksSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int().min(0),
    }),
  ),
});

export type UpdateHomeDraftInput = z.infer<typeof updateHomeDraftSchema>;
export type CreatePageBlockInput = z.infer<typeof createPageBlockSchema>;
export type UpdatePageBlockInput = z.infer<typeof updatePageBlockSchema>;
export type ReorderLayoutBlocksInput = z.infer<typeof reorderLayoutBlocksSchema>;
