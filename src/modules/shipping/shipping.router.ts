import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as shippingController from './shipping.controller.js';

export const shippingCarriersAdminRouter = Router();
export const shippingMethodsAdminRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');
const orderRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF');

shippingCarriersAdminRouter.get(
  '/active',
  requireAuth,
  orderRoles,
  asyncHandler(shippingController.listActiveShippingCarriers),
);

shippingCarriersAdminRouter.use(requireAuth, adminRoles);
shippingCarriersAdminRouter.get(
  '/',
  asyncHandler(shippingController.listShippingCarriers),
);
shippingCarriersAdminRouter.post(
  '/',
  asyncHandler(shippingController.createShippingCarrier),
);
shippingCarriersAdminRouter.get(
  '/:id',
  asyncHandler(shippingController.getShippingCarrier),
);
shippingCarriersAdminRouter.put(
  '/:id',
  asyncHandler(shippingController.updateShippingCarrier),
);
shippingCarriersAdminRouter.delete(
  '/:id',
  asyncHandler(shippingController.deleteShippingCarrier),
);

shippingMethodsAdminRouter.use(requireAuth, adminRoles);
shippingMethodsAdminRouter.get(
  '/',
  asyncHandler(shippingController.listShippingMethods),
);
shippingMethodsAdminRouter.post(
  '/',
  asyncHandler(shippingController.createShippingMethod),
);
shippingMethodsAdminRouter.get(
  '/:id',
  asyncHandler(shippingController.getShippingMethod),
);
shippingMethodsAdminRouter.put(
  '/:id',
  asyncHandler(shippingController.updateShippingMethod),
);
shippingMethodsAdminRouter.delete(
  '/:id',
  asyncHandler(shippingController.deleteShippingMethod),
);
