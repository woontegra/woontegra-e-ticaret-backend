import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import {
  listProductReviewsQuerySchema,
  listPublicProductReviewsQuerySchema,
  replyProductReviewSchema,
  submitProductReviewSchema,
} from './reviews.schema.js';
import * as productReviewService from './product-review.service.js';

export async function submitProductReview(req: Request, res: Response) {
  const input = submitProductReviewSchema.parse(req.body);
  const data = await productReviewService.submitProductReview(
    req.params.slug,
    input,
  );
  sendCreated(res, data);
}

export async function listApprovedProductReviews(req: Request, res: Response) {
  const query = listPublicProductReviewsQuerySchema.parse(req.query);
  const data = await productReviewService.listApprovedReviewsByProductSlug(
    req.params.slug,
    query,
  );
  sendSuccess(res, data);
}

export async function listProductReviews(req: Request, res: Response) {
  const query = listProductReviewsQuerySchema.parse(req.query);
  const data = await productReviewService.listProductReviews(query);
  sendSuccess(res, data);
}

export async function getProductReview(req: Request, res: Response) {
  const data = await productReviewService.getProductReviewById(req.params.id);
  sendSuccess(res, data);
}

export async function approveProductReview(req: Request, res: Response) {
  const data = await productReviewService.approveProductReview(req.params.id);
  sendSuccess(res, data);
}

export async function rejectProductReview(req: Request, res: Response) {
  const data = await productReviewService.rejectProductReview(req.params.id);
  sendSuccess(res, data);
}

export async function replyProductReview(req: Request, res: Response) {
  const input = replyProductReviewSchema.parse(req.body);
  const data = await productReviewService.replyToProductReview(
    req.params.id,
    input.adminReply,
  );
  sendSuccess(res, data);
}

export async function deleteProductReview(req: Request, res: Response) {
  await productReviewService.deleteProductReview(req.params.id);
  sendSuccess(res, { ok: true });
}
