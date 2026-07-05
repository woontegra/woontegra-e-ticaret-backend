import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as promotionController from './promotion.controller.js';

export const couponsAdminRouter = Router();
export const campaignsAdminRouter = Router();
export const promotionPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');

couponsAdminRouter.use(requireAuth, adminRoles);
couponsAdminRouter.get('/', asyncHandler(promotionController.listCoupons));
couponsAdminRouter.post('/', asyncHandler(promotionController.createCoupon));
couponsAdminRouter.put('/:id', asyncHandler(promotionController.updateCoupon));
couponsAdminRouter.delete('/:id', asyncHandler(promotionController.deleteCoupon));

campaignsAdminRouter.use(requireAuth, adminRoles);
campaignsAdminRouter.get('/', asyncHandler(promotionController.listCampaigns));
campaignsAdminRouter.post('/', asyncHandler(promotionController.createCampaign));
campaignsAdminRouter.put('/:id', asyncHandler(promotionController.updateCampaign));
campaignsAdminRouter.delete('/:id', asyncHandler(promotionController.deleteCampaign));

promotionPublicRouter.get(
  '/campaigns',
  asyncHandler(promotionController.listPublicCampaigns),
);
promotionPublicRouter.get(
  '/campaigns/:id',
  asyncHandler(promotionController.getPublicCampaign),
);

export {
  applyCartCoupon,
  removeCartCoupon,
} from './promotion.controller.js';
