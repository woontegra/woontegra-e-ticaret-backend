import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { publicWriteRateLimiter } from '../../middlewares/rate-limit.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as commerceController from './commerce.controller.js';

export const cartPublicRouter = Router();
export const checkoutPublicRouter = Router();
export const ordersPublicRouter = Router();
export const ordersAdminRouter = Router();

cartPublicRouter.get('/', asyncHandler(commerceController.getCart));
cartPublicRouter.post('/items', asyncHandler(commerceController.addCartItem));
cartPublicRouter.patch(
  '/items/:id',
  asyncHandler(commerceController.updateCartItem),
);
cartPublicRouter.delete(
  '/items/:id',
  asyncHandler(commerceController.removeCartItem),
);
cartPublicRouter.post(
  '/coupon',
  asyncHandler(commerceController.applyCartCoupon),
);
cartPublicRouter.delete(
  '/coupon',
  asyncHandler(commerceController.removeCartCoupon),
);

checkoutPublicRouter.post(
  '/',
  publicWriteRateLimiter,
  asyncHandler(commerceController.checkout),
);

ordersPublicRouter.get(
  '/:orderNumber/downloads',
  asyncHandler(commerceController.getPublicOrderDownloads),
);
ordersPublicRouter.get(
  '/:orderNumber',
  asyncHandler(commerceController.getPublicOrder),
);

const orderAdminRoles = requireRoles(
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'STAFF',
);

ordersAdminRouter.use(requireAuth, orderAdminRoles);
ordersAdminRouter.get('/', asyncHandler(commerceController.listOrders));
ordersAdminRouter.patch(
  '/:id/status',
  asyncHandler(commerceController.updateOrderStatus),
);
ordersAdminRouter.patch(
  '/:id/payment-status',
  asyncHandler(commerceController.updateOrderPaymentStatus),
);
ordersAdminRouter.patch(
  '/:id/shipping-status',
  asyncHandler(commerceController.updateOrderShippingStatus),
);
ordersAdminRouter.patch(
  '/:id/note',
  asyncHandler(commerceController.updateOrderAdminNote),
);
ordersAdminRouter.patch(
  '/:id/shipment',
  asyncHandler(commerceController.updateOrderShipment),
);
ordersAdminRouter.post(
  '/:id/retry-digital-delivery',
  asyncHandler(commerceController.retryOrderDigitalDelivery),
);
ordersAdminRouter.get('/:id', asyncHandler(commerceController.getOrder));
