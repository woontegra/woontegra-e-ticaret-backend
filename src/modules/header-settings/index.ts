import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as headerSettingsController from './header-settings.controller.js';

export const headerSettingsAdminRouter = Router();
export const headerSettingsPublicRouter = Router();

headerSettingsAdminRouter.use(requireAuth, requireRoles('SUPER_ADMIN', 'OWNER', 'ADMIN'));
headerSettingsAdminRouter.get('/', asyncHandler(headerSettingsController.getHeaderSettings));
headerSettingsAdminRouter.put('/', asyncHandler(headerSettingsController.updateHeaderSettings));

headerSettingsPublicRouter.get('/', asyncHandler(headerSettingsController.getHeaderSettings));
