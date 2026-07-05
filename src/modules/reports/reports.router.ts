import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as reportsController from './reports.controller.js';

export const dashboardAdminRouter = Router();
export const reportsAdminRouter = Router();

const staffRoles = requireRoles(
  'SUPER_ADMIN',
  'ADMIN',
  'ADMIN',
  'STAFF',
);

dashboardAdminRouter.use(requireAuth, staffRoles);
dashboardAdminRouter.get(
  '/summary',
  asyncHandler(reportsController.getDashboardSummary),
);

reportsAdminRouter.use(requireAuth, staffRoles);
reportsAdminRouter.get(
  '/sales-by-day',
  asyncHandler(reportsController.getSalesByDay),
);
reportsAdminRouter.get(
  '/orders-by-status',
  asyncHandler(reportsController.getOrdersByStatus),
);
reportsAdminRouter.get(
  '/top-products',
  asyncHandler(reportsController.getTopProducts),
);
reportsAdminRouter.get(
  '/low-stock-products',
  asyncHandler(reportsController.getLowStockProducts),
);
reportsAdminRouter.get(
  '/new-customers',
  asyncHandler(reportsController.getNewCustomers),
);
reportsAdminRouter.get(
  '/payment-method-summary',
  asyncHandler(reportsController.getPaymentMethodSummary),
);
