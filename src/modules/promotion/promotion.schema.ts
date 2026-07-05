import { CouponType, CampaignType } from '@prisma/client';
import { z } from 'zod';

const idArraySchema = z.array(z.string().min(1)).default([]);

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/i, 'Kod yalnızca harf, rakam, - ve _ içerebilir')
    .transform((v) => v.toUpperCase()),
  type: z.nativeEnum(CouponType),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().positive().nullable().optional(),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  usageLimitPerCustomer: z.coerce.number().int().positive().nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
  applicableProductIds: idArraySchema.optional(),
  applicableCategoryIds: idArraySchema.optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const applyCouponSchema = z.object({
  code: z.string().min(1).max(40),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.nativeEnum(CampaignType),
  bannerImageId: z.string().min(1).nullable().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  buttonText: z.string().max(80).nullable().optional(),
  buttonUrl: z.string().max(500).nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
