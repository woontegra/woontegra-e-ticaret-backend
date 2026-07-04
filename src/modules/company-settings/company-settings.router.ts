import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as companySettingsController from './company-settings.controller.js';

export const companySettingsAdminRouter = Router();

companySettingsAdminRouter.use(requireAuth);
companySettingsAdminRouter.use(requireRoles('SUPER_ADMIN', 'OWNER'));

companySettingsAdminRouter.get('/', asyncHandler(companySettingsController.getCompanySettings));
companySettingsAdminRouter.put('/', asyncHandler(companySettingsController.updateCompanySettings));

export const companySettingsPublicRouter = Router();

companySettingsPublicRouter.get('/', asyncHandler(companySettingsController.getCompanySettings));
