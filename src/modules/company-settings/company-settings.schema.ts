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

export const updateCompanySettingSchema = z.object({
  companyName: z.string().max(200).optional(),
  tradeName: z.string().max(200).optional(),
  taxNumber: z.string().max(50).optional(),
  taxOffice: z.string().max(100).optional(),
  mersisNumber: z.string().max(50).nullable().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  supportEmail: z.string().email().or(z.literal('')).optional(),
  workingHours: z.string().max(500).optional(),
  currency: z.string().length(3).optional(),
  defaultTaxRate: z.coerce.number().min(0).max(100).optional(),
  socialLinks: socialLinksSchema,
});

export type UpdateCompanySettingInput = z.infer<typeof updateCompanySettingSchema>;
