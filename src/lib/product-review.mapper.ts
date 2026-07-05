import type { Product, ProductReview } from '@prisma/client';
import type {
  ProductKind,
  ProductReviewDto,
  ProductReviewPublicDto,
  ProductReviewSummaryDto,
  ProductReviewsPublicResult,
} from '../types/api.js';

type ReviewWithProduct = ProductReview & {
  product?: Pick<Product, 'id' | 'name' | 'slug' | 'productKind'> | null;
};

export function toProductReviewDto(review: ReviewWithProduct): ProductReviewDto {
  return {
    id: review.id,
    productId: review.productId,
    productName: review.product?.name ?? null,
    productSlug: review.product?.slug ?? null,
    productKind: (review.product?.productKind ?? null) as ProductKind | null,
    customerId: review.customerId,
    orderId: review.orderId,
    name: review.name,
    email: review.email,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    status: review.status,
    adminReply: review.adminReply,
    approvedAt: review.approvedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

export function toProductReviewSummaryDto(
  review: ReviewWithProduct,
): ProductReviewSummaryDto {
  return {
    id: review.id,
    productId: review.productId,
    productName: review.product?.name ?? null,
    productSlug: review.product?.slug ?? null,
    productKind: (review.product?.productKind ?? null) as ProductKind | null,
    name: review.name,
    rating: review.rating,
    title: review.title,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
  };
}

export function toProductReviewPublicDto(
  review: ProductReview,
): ProductReviewPublicDto {
  return {
    id: review.id,
    name: review.name,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    adminReply: review.adminReply,
    approvedAt: review.approvedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
  };
}

export function toProductReviewsPublicResult(
  items: ProductReview[],
  total: number,
  averageRating: number | null,
): ProductReviewsPublicResult {
  return {
    items: items.map(toProductReviewPublicDto),
    total,
    averageRating,
  };
}
