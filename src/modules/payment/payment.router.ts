import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { publicWriteRateLimiter } from '../../middlewares/rate-limit.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as paymentController from './payment.controller.js';

export const paymentMethodsAdminRouter = Router();
export const paymentMethodsPublicRouter = Router();
export const paymentsPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');

paymentMethodsAdminRouter.use(requireAuth, adminRoles);
paymentMethodsAdminRouter.get(
  '/',
  asyncHandler(paymentController.listPaymentMethods),
);
paymentMethodsAdminRouter.get(
  '/:id',
  asyncHandler(paymentController.getPaymentMethod),
);
paymentMethodsAdminRouter.put(
  '/:id',
  asyncHandler(paymentController.updatePaymentMethod),
);

paymentMethodsPublicRouter.get(
  '/',
  asyncHandler(paymentController.listPublicPaymentMethods),
);

paymentsPublicRouter.post(
  '/paytr/start',
  publicWriteRateLimiter,
  asyncHandler(paymentController.startPaytrPaymentHandler),
);
paymentsPublicRouter.post(
  '/paytr/callback',
  asyncHandler(paymentController.paytrCallbackHandler),
);
