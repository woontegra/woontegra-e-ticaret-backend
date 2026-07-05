import { z } from 'zod';

const socialLinksSchema = z
  .object({
    facebook: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
    youtube: z.string().url().or(z.literal('')).optional(),
    tiktok: z.string().url().or(z.literal('')).optional(),
  })
  .optional();

export const updateFooterSettingSchema = z.object({
  logoMediaId: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  showNewsletter: z.boolean().optional(),
  copyrightText: z.string().max(500).nullable().optional(),
  socialLinks: socialLinksSchema,
  paymentIconIds: z.array(z.string()).optional(),
  shippingIconIds: z.array(z.string()).optional(),
});

export type UpdateFooterSettingInput = z.infer<
  typeof updateFooterSettingSchema
>;
