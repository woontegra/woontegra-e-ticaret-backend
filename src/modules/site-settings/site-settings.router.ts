import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as siteSettingsController from './site-settings.controller.js';

export const siteSettingsAdminRouter = Router();

siteSettingsAdminRouter.use(requireAuth);
siteSettingsAdminRouter.use(requireRoles('SUPER_ADMIN', 'ADMIN'));

siteSettingsAdminRouter.get('/', asyncHandler(siteSettingsController.getSiteSettings));
siteSettingsAdminRouter.put('/', asyncHandler(siteSettingsController.updateSiteSettings));

export const siteSettingsPublicRouter = Router();

siteSettingsPublicRouter.get('/', asyncHandler(siteSettingsController.getSiteSettings));
