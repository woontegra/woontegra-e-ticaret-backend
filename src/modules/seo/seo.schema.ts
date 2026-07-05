import { z } from 'zod';

export const updateSeoSettingSchema = z.object({
  defaultTitle: z.string().max(200).optional(),
  defaultDescription: z.string().max(500).optional(),
  defaultOgImageId: z.string().nullable().optional(),
  robotsTxt: z.string().max(20_000).optional(),
  googleAnalyticsId: z.string().max(80).nullable().optional(),
  metaPixelId: z.string().max(80).nullable().optional(),
  canonicalBaseUrl: z.string().max(500).nullable().optional(),
  sitemapIncludeProducts: z.boolean().optional(),
  sitemapIncludeCategories: z.boolean().optional(),
  sitemapIncludePages: z.boolean().optional(),
  sitemapIncludeBlogPosts: z.boolean().optional(),
});

export const createRedirectRuleSchema = z.object({
  sourcePath: z
    .string()
    .min(1)
    .max(500)
    .regex(/^\//, 'Kaynak yol / ile başlamalı'),
  targetPath: z.string().min(1).max(500),
  statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
  isActive: z.boolean().optional(),
});

export const updateRedirectRuleSchema = createRedirectRuleSchema.partial();

export type UpdateSeoSettingInput = z.infer<typeof updateSeoSettingSchema>;
export type CreateRedirectRuleInput = z.infer<typeof createRedirectRuleSchema>;
export type UpdateRedirectRuleInput = z.infer<typeof updateRedirectRuleSchema>;
