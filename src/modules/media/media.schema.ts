import { z } from 'zod';

import { paginationQuerySchema } from '../../lib/pagination.js';

const mediaUsageTypeSchema = z.enum([
  'IMAGE',
  'LOGO',
  'FAVICON',
  'HERO_IMAGE',
  'PRODUCT_IMAGE',
  'BLOG_IMAGE',
  'BUILDER_IMAGE',
  'CAMPAIGN_IMAGE',
  'DOCUMENT',
  'DOWNLOAD_BINARY',
]);

export const listMediaQuerySchema = paginationQuerySchema.extend({
  folder: z.string().optional(),
  search: z.string().optional(),
  type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  usageType: mediaUsageTypeSchema.optional(),
  storageProvider: z.enum(['LOCAL', 'VERCEL_BLOB', 'R2']).optional(),
  library: z.enum(['all', 'images', 'downloads', 'documents']).optional(),
});

export const updateMediaSchema = z.object({
  altText: z.string().max(500).nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  folder: z.string().max(100).optional(),
  usageType: mediaUsageTypeSchema.nullable().optional(),
});

export const uploadMediaBodySchema = z.object({
  folder: z.string().max(100).optional(),
  usageType: mediaUsageTypeSchema.optional(),
});

export const uploadDownloadBodySchema = z.object({
  folder: z.string().max(100).optional(),
  label: z.string().max(200).optional(),
});

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
