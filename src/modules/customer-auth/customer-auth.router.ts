import { Router } from 'express';
import { authRateLimiter } from '../../middlewares/rate-limit.middleware.js';
import {
  optionalCustomerAuth,
  requireCustomerAuth,
} from '../../middlewares/customer-auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as customerAuthController from './customer-auth.controller.js';

export const customerAuthRouter = Router();

customerAuthRouter.post(
  '/register',
  authRateLimiter,
  asyncHandler(customerAuthController.register),
);
customerAuthRouter.post(
  '/login',
  authRateLimiter,
  asyncHandler(customerAuthController.login),
);
customerAuthRouter.get(
  '/me',
  requireCustomerAuth,
  asyncHandler(customerAuthController.me),
);
customerAuthRouter.post(
  '/logout',
  requireCustomerAuth,
  asyncHandler(customerAuthController.logout),
);

export { optionalCustomerAuth, requireCustomerAuth };
