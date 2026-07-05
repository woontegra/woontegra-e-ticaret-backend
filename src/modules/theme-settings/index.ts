import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as themeSettingsController from './theme-settings.controller.js';

export const themeSettingsAdminRouter = Router();
export const themeSettingsPublicRouter = Router();

themeSettingsAdminRouter.use(requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
themeSettingsAdminRouter.get('/', asyncHandler(themeSettingsController.getThemeSettings));
themeSettingsAdminRouter.put('/', asyncHandler(themeSettingsController.updateThemeSettings));

themeSettingsPublicRouter.get('/', asyncHandler(themeSettingsController.getThemeSettings));
