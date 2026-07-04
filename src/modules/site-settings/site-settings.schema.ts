import { z } from 'zod';

const optionalMediaId = z.string().min(1).nullable().optional();

export const updateSiteSettingSchema = z.object({
  siteName: z.string().max(200).optional(),
  siteDescription: z.string().max(1000).optional(),
  defaultSeoTitle: z.string().max(200).optional(),
  defaultSeoDescription: z.string().max(500).optional(),
  domain: z.string().max(255).optional(),
  maintenanceMode: z.boolean().optional(),
  logoMediaId: optionalMediaId,
  faviconMediaId: optionalMediaId,
  ogImageMediaId: optionalMediaId,
});

export type UpdateSiteSettingInput = z.infer<typeof updateSiteSettingSchema>;
