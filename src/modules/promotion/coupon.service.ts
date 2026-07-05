import { AppError } from '../../lib/app-error.js';
import { toCouponDto } from '../../lib/promotion.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateCouponInput, ListCouponsQuery, UpdateCouponInput } from './promotion.schema.js';
import { resolvePagination } from '../../lib/pagination.js';

export async function listCoupons(query: ListCouponsQuery = {}) {
  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [
            { code: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const { skip, limit } = resolvePagination(query);

  const [items, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return { items: items.map(toCouponDto), total };
}

export async function getCouponById(id: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw AppError.notFound('Coupon not found');
  return toCouponDto(coupon);
}

export async function createCoupon(input: CreateCouponInput) {
  const coupon = await prisma.coupon.create({
    data: {
      code: input.code,
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount ?? null,
      usageLimit: input.usageLimit ?? null,
      usageLimitPerCustomer: input.usageLimitPerCustomer ?? null,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      isActive: input.isActive ?? true,
      applicableProductIds: input.applicableProductIds ?? [],
      applicableCategoryIds: input.applicableCategoryIds ?? [],
    },
  });
  return toCouponDto(coupon);
}

export async function updateCoupon(id: string, input: UpdateCouponInput) {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Coupon not found');

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.value !== undefined ? { value: input.value } : {}),
      ...(input.minOrderAmount !== undefined
        ? { minOrderAmount: input.minOrderAmount }
        : {}),
      ...(input.usageLimit !== undefined ? { usageLimit: input.usageLimit } : {}),
      ...(input.usageLimitPerCustomer !== undefined
        ? { usageLimitPerCustomer: input.usageLimitPerCustomer }
        : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.applicableProductIds !== undefined
        ? { applicableProductIds: input.applicableProductIds }
        : {}),
      ...(input.applicableCategoryIds !== undefined
        ? { applicableCategoryIds: input.applicableCategoryIds }
        : {}),
    },
  });

  return toCouponDto(coupon);
}

export async function deleteCoupon(id: string) {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Coupon not found');
  await prisma.coupon.delete({ where: { id } });
}
