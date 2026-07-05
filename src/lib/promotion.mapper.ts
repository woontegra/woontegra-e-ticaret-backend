import type { Campaign, Coupon, Product } from '@prisma/client';
import type {
  CampaignDto,
  CampaignPublicDto,
  CouponDto,
} from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

function parseIdArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function toCouponDto(coupon: Coupon): CouponDto {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    minOrderAmount:
      coupon.minOrderAmount !== null ? Number(coupon.minOrderAmount) : null,
    usageLimit: coupon.usageLimit,
    usageLimitPerCustomer: coupon.usageLimitPerCustomer,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    endsAt: coupon.endsAt?.toISOString() ?? null,
    isActive: coupon.isActive,
    applicableProductIds: parseIdArray(coupon.applicableProductIds),
    applicableCategoryIds: parseIdArray(coupon.applicableCategoryIds),
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}

export async function toCampaignDto(campaign: Campaign): Promise<CampaignDto> {
  const urlMap = await resolveMediaUrlMap([campaign.bannerImageId]);
  return {
    id: campaign.id,
    name: campaign.name,
    type: campaign.type,
    bannerImageId: campaign.bannerImageId,
    bannerImageUrl: campaign.bannerImageId
      ? (urlMap.get(campaign.bannerImageId) ?? null)
      : null,
    title: campaign.title,
    description: campaign.description,
    buttonText: campaign.buttonText,
    buttonUrl: campaign.buttonUrl,
    startsAt: campaign.startsAt?.toISOString() ?? null,
    endsAt: campaign.endsAt?.toISOString() ?? null,
    isActive: campaign.isActive,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}

export async function toCampaignPublicDto(
  campaign: Campaign,
): Promise<CampaignPublicDto> {
  const dto = await toCampaignDto(campaign);
  return {
    id: dto.id,
    type: dto.type,
    bannerImageUrl: dto.bannerImageUrl,
    title: dto.title,
    description: dto.description,
    buttonText: dto.buttonText,
    buttonUrl: dto.buttonUrl,
  };
}

export { parseIdArray };

export type CartItemForCoupon = {
  productId: string;
  quantity: number;
  unitPrice: number | { toString(): string };
  product: Pick<Product, 'categoryId'>;
};
