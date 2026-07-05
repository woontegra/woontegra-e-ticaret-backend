import type { Prisma } from '@prisma/client';
import { ProductReviewStatus, ProductStatus } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  toProductReviewDto,
  toProductReviewSummaryDto,
  toProductReviewsPublicResult,
} from '../../lib/product-review.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  ListProductReviewsQuery,
  ListPublicProductReviewsQuery,
  SubmitProductReviewInput,
} from './reviews.schema.js';
import { notifyNewReview } from '../notifications/notification.service.js';
import { sendReviewApprovedEmail } from '../mail/mail-order.service.js';

const reviewInclude = {
  product: { select: { id: true, name: true, slug: true, productKind: true } },
} as const;

function buildWhere(
  query: ListProductReviewsQuery,
): Prisma.ProductReviewWhereInput {
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { title: { contains: query.search, mode: 'insensitive' } },
            { comment: { contains: query.search, mode: 'insensitive' } },
            {
              product: {
                name: { contains: query.search, mode: 'insensitive' },
              },
            },
          ],
        }
      : {}),
  };
}

async function getActiveProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, status: ProductStatus.ACTIVE },
    select: { id: true, name: true, slug: true },
  });
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

export async function submitProductReview(
  productSlug: string,
  input: SubmitProductReviewInput,
) {
  const product = await getActiveProductBySlug(productSlug);

  const review = await prisma.productReview.create({
    data: {
      productId: product.id,
      customerId: input.customerId ?? null,
      orderId: input.orderId ?? null,
      name: input.name,
      email: input.email,
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment,
      status: ProductReviewStatus.PENDING,
    },
    include: reviewInclude,
  });

  notifyNewReview({
    id: review.id,
    name: review.name,
    productName: product.name,
    rating: review.rating,
  });

  return toProductReviewDto(review);
}

export async function listApprovedReviewsByProductSlug(
  productSlug: string,
  query: ListPublicProductReviewsQuery,
) {
  const product = await getActiveProductBySlug(productSlug);
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const where = {
    productId: product.id,
    status: ProductReviewStatus.APPROVED,
  };

  const [items, total, aggregate] = await Promise.all([
    prisma.productReview.findMany({
      where,
      orderBy: [{ approvedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.productReview.count({ where }),
    prisma.productReview.aggregate({
      where,
      _avg: { rating: true },
    }),
  ]);

  return toProductReviewsPublicResult(
    items,
    total,
    aggregate._avg.rating !== null
      ? Math.round(aggregate._avg.rating * 10) / 10
      : null,
  );
}

export async function listProductReviews(query: ListProductReviewsQuery) {
  const where = buildWhere(query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.productReview.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.productReview.count({ where }),
  ]);

  return {
    items: items.map(toProductReviewSummaryDto),
    total,
  };
}

export async function getProductReviewById(id: string) {
  const review = await prisma.productReview.findUnique({
    where: { id },
    include: reviewInclude,
  });
  if (!review) throw AppError.notFound('Product review not found');
  return toProductReviewDto(review);
}

export async function approveProductReview(id: string) {
  const existing = await prisma.productReview.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Product review not found');

  const review = await prisma.productReview.update({
    where: { id },
    data: {
      status: ProductReviewStatus.APPROVED,
      approvedAt: new Date(),
    },
    include: reviewInclude,
  });

  void sendReviewApprovedEmail({
    customerEmail: review.email,
    customerName: review.name,
    productName: review.product.name,
  }).catch((error) => {
    console.error('[mail] REVIEW_APPROVED failed', error);
  });

  return toProductReviewDto(review);
}

export async function rejectProductReview(id: string) {
  const existing = await prisma.productReview.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Product review not found');

  const review = await prisma.productReview.update({
    where: { id },
    data: {
      status: ProductReviewStatus.REJECTED,
      approvedAt: null,
    },
    include: reviewInclude,
  });

  return toProductReviewDto(review);
}

export async function replyToProductReview(id: string, adminReply: string) {
  const existing = await prisma.productReview.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Product review not found');

  const review = await prisma.productReview.update({
    where: { id },
    data: { adminReply },
    include: reviewInclude,
  });

  return toProductReviewDto(review);
}

export async function deleteProductReview(id: string) {
  const existing = await prisma.productReview.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Product review not found');
  await prisma.productReview.delete({ where: { id } });
}
