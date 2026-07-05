import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as notificationController from './notification.controller.js';

export const notificationsAdminRouter = Router();

const staffRoles = requireRoles(
  'SUPER_ADMIN',
  'ADMIN',
  'ADMIN',
  'STAFF',
);

notificationsAdminRouter.use(requireAuth, staffRoles);
notificationsAdminRouter.get(
  '/',
  asyncHandler(notificationController.listNotifications),
);
notificationsAdminRouter.get(
  '/unread-count',
  asyncHandler(notificationController.getUnreadCount),
);
notificationsAdminRouter.patch(
  '/read-all',
  asyncHandler(notificationController.markAllNotificationsRead),
);
notificationsAdminRouter.patch(
  '/:id/read',
  asyncHandler(notificationController.markNotificationRead),
);
