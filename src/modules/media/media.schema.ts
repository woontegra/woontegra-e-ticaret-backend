import { z } from 'zod';

export const listMediaQuerySchema = z.object({
  folder: z.string().optional(),
  search: z.string().optional(),
  type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
});

export const updateMediaSchema = z.object({
  altText: z.string().max(500).nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  folder: z.string().max(100).optional(),
  usageType: z.string().max(100).nullable().optional(),
});

export const uploadMediaBodySchema = z.object({
  folder: z.string().max(100).optional(),
  usageType: z.string().max(100).optional(),
});

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
