import { z } from 'zod';

const footerLinkTypeSchema = z.enum([
  'PAGE',
  'CATEGORY',
  'PRODUCT',
  'BLOG',
  'CUSTOM_URL',
]);

export const createFooterLinkSchema = z.object({
  label: z.string().min(1).max(200),
  type: footerLinkTypeSchema,
  targetId: z.string().nullable().optional(),
  url: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
});

export const updateFooterLinkSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  type: footerLinkTypeSchema.optional(),
  targetId: z.string().nullable().optional(),
  url: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
});

export type CreateFooterLinkInput = z.infer<typeof createFooterLinkSchema>;
export type UpdateFooterLinkInput = z.infer<typeof updateFooterLinkSchema>;
