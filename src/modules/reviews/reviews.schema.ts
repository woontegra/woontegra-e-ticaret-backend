import { ProductReviewStatus } from '@prisma/client';
import { z } from 'zod';

export const submitProductReviewSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(200).nullable().optional(),
  comment: z.string().min(5).max(5000),
  customerId: z.string().max(100).nullable().optional(),
  orderId: z.string().max(100).nullable().optional(),
});

export const listProductReviewsQuerySchema = z.object({
  status: z.nativeEnum(ProductReviewStatus).optional(),
  productId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const listPublicProductReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const replyProductReviewSchema = z.object({
  adminReply: z.string().min(1).max(5000),
});

export type SubmitProductReviewInput = z.infer<typeof submitProductReviewSchema>;
export type ListProductReviewsQuery = z.infer<
  typeof listProductReviewsQuerySchema
>;
export type ListPublicProductReviewsQuery = z.infer<
  typeof listPublicProductReviewsQuerySchema
>;
