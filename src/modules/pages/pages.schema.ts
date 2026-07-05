import { PageStatus, PageType } from '@prisma/client';
import { z } from 'zod';
import { isValidSlug, slugify } from '../../lib/slug.js';
import { optionalSanitizedHtml } from '../../lib/html-sanitize.js';

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .transform((value) => slugify(value))
  .refine((value) => isValidSlug(value), { message: 'Invalid slug format' });

const optionalMediaId = z.string().min(1).nullable().optional();

import { paginationQuerySchema } from '../../lib/pagination.js';

export const listPagesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.nativeEnum(PageStatus).optional(),
  pageType: z.nativeEnum(PageType).optional(),
});

export const createPageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  status: z.nativeEnum(PageStatus).optional(),
  pageType: z.nativeEnum(PageType).optional(),
  excerpt: z.string().max(500).nullable().optional(),
  contentHtml: z
    .string()
    .optional()
    .transform((value) => optionalSanitizedHtml(value)),
  blocksJson: z.unknown().nullable().optional(),
  featuredImageId: optionalMediaId,
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  ogImageId: optionalMediaId,
  canonicalUrl: z.string().url().nullable().optional().or(z.literal('').transform(() => null)),
  robotsIndex: z.boolean().optional(),
});

export const updatePageSchema = createPageSchema.partial().extend({
  slug: slugSchema.optional(),
});

export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
