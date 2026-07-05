import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { publicWriteRateLimiter } from '../../middlewares/rate-limit.middleware.js';
import { validateSlugParam } from '../../middlewares/validate-slug.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as reviewsController from './reviews.controller.js';

export const reviewsPublicRouter = Router();
export const reviewsAdminRouter = Router();

const staffRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF');

reviewsPublicRouter.post(
  '/products/:slug/reviews',
  publicWriteRateLimiter,
  validateSlugParam(),
  asyncHandler(reviewsController.submitProductReview),
);
reviewsPublicRouter.get(
  '/products/:slug/reviews',
  validateSlugParam(),
  asyncHandler(reviewsController.listApprovedProductReviews),
);

reviewsAdminRouter.use(requireAuth, staffRoles);
reviewsAdminRouter.get('/', asyncHandler(reviewsController.listProductReviews));
reviewsAdminRouter.get(
  '/:id',
  asyncHandler(reviewsController.getProductReview),
);
reviewsAdminRouter.patch(
  '/:id/approve',
  asyncHandler(reviewsController.approveProductReview),
);
reviewsAdminRouter.patch(
  '/:id/reject',
  asyncHandler(reviewsController.rejectProductReview),
);
reviewsAdminRouter.patch(
  '/:id/reply',
  asyncHandler(reviewsController.replyProductReview),
);
reviewsAdminRouter.delete(
  '/:id',
  asyncHandler(reviewsController.deleteProductReview),
);
