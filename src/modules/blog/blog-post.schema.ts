import { PageStatus } from '@prisma/client';
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

export const listBlogPostsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.nativeEnum(PageStatus).optional(),
  categoryId: z.string().optional(),
});

export const publicBlogPostsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema.optional(),
  excerpt: z.string().max(500).nullable().optional(),
  contentHtml: z
    .string()
    .optional()
    .transform((value) => optionalSanitizedHtml(value)),
  coverImageId: optionalMediaId,
  categoryId: z.string().nullable().optional(),
  status: z.nativeEnum(PageStatus).optional(),
  authorName: z.string().max(120).nullable().optional(),
  readingTime: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string().max(50)).optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  ogImageId: optionalMediaId,
  robotsIndex: z.boolean().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export type ListBlogPostsQuery = z.infer<typeof listBlogPostsQuerySchema>;
export type PublicBlogPostsQuery = z.infer<typeof publicBlogPostsQuerySchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
