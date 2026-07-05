import type { Coupon } from '@prisma/client';
import { CouponType } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { parseIdArray, type CartItemForCoupon } from '../../lib/promotion.mapper.js';
import { roundMoney } from '../../lib/order.mapper.js';
import { prisma } from '../../lib/prisma.js';

function isWithinSchedule(
  startsAt: Date | null,
  endsAt: Date | null,
  now = new Date(),
): boolean {
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
}

function getEligibleSubtotal(
  items: CartItemForCoupon[],
  productIds: string[],
  categoryIds: string[],
): number {
  if (productIds.length === 0 && categoryIds.length === 0) {
    return items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );
  }

  return items.reduce((sum, item) => {
    const matchesProduct = productIds.includes(item.productId);
    const matchesCategory =
      item.product.categoryId !== null &&
      categoryIds.includes(item.product.categoryId);
    if (matchesProduct || matchesCategory) {
      return sum + Number(item.unitPrice) * item.quantity;
    }
    return sum;
  }, 0);
}

export async function countCouponUsage(couponId: string): Promise<number> {
  return prisma.order.count({ where: { couponId } });
}

export async function countCouponUsageByEmail(
  couponId: string,
  email: string,
): Promise<number> {
  return prisma.order.count({
    where: {
      couponId,
      customerEmail: { equals: email, mode: 'insensitive' },
    },
  });
}

export async function validateCouponForCart(
  coupon: Coupon,
  items: CartItemForCoupon[],
  customerEmail?: string | null,
) {
  if (!coupon.isActive) {
    throw AppError.badRequest('Kupon geçerli değil');
  }

  if (!isWithinSchedule(coupon.startsAt, coupon.endsAt)) {
    throw AppError.badRequest('Kupon süresi dolmuş veya henüz başlamadı');
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  const minOrder = coupon.minOrderAmount !== null ? Number(coupon.minOrderAmount) : null;
  if (minOrder !== null && subtotal < minOrder) {
    throw AppError.badRequest(`Minimum sipariş tutarı ${minOrder} TL`);
  }

  const productIds = parseIdArray(coupon.applicableProductIds);
  const categoryIds = parseIdArray(coupon.applicableCategoryIds);
  const eligibleSubtotal = getEligibleSubtotal(items, productIds, categoryIds);

  if (productIds.length > 0 || categoryIds.length > 0) {
    if (eligibleSubtotal <= 0) {
      throw AppError.badRequest('Kupon sepetinizdeki ürünler için geçerli değil');
    }
  }

  if (coupon.usageLimit !== null) {
    const used = await countCouponUsage(coupon.id);
    if (used >= coupon.usageLimit) {
      throw AppError.badRequest('Kupon kullanım limitine ulaşıldı');
    }
  }

  if (coupon.usageLimitPerCustomer !== null && customerEmail) {
    const usedByCustomer = await countCouponUsageByEmail(coupon.id, customerEmail);
    if (usedByCustomer >= coupon.usageLimitPerCustomer) {
      throw AppError.badRequest('Bu kuponu daha önce kullandınız');
    }
  }

  return { eligibleSubtotal, subtotal };
}

export function calculateCouponDiscount(
  coupon: Coupon,
  eligibleSubtotal: number,
  shippingTotal = 0,
): number {
  switch (coupon.type) {
    case CouponType.PERCENTAGE: {
      const rate = Math.min(Number(coupon.value), 100);
      return roundMoney(eligibleSubtotal * (rate / 100));
    }
    case CouponType.FIXED_AMOUNT:
      return roundMoney(Math.min(Number(coupon.value), eligibleSubtotal));
    case CouponType.FREE_SHIPPING:
      return roundMoney(shippingTotal);
    default:
      return 0;
  }
}

export async function findCouponByCode(code: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon) {
    throw AppError.notFound('Kupon bulunamadı');
  }
  return coupon;
}

export function isCampaignActive(
  campaign: {
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  },
  now = new Date(),
): boolean {
  return campaign.isActive && isWithinSchedule(campaign.startsAt, campaign.endsAt, now);
}
