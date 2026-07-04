import { Router } from 'express';
import { authRouter } from '../modules/auth/index.js';
import {
  companySettingsAdminRouter,
  companySettingsPublicRouter,
} from '../modules/company-settings/index.js';
import { healthRouter } from '../modules/health/index.js';
import {
  siteSettingsAdminRouter,
  siteSettingsPublicRouter,
} from '../modules/site-settings/index.js';
import { usersRouter } from '../modules/users/index.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);

apiRouter.use('/admin/site-settings', siteSettingsAdminRouter);
apiRouter.use('/admin/company-settings', companySettingsAdminRouter);
apiRouter.use('/public/site-settings', siteSettingsPublicRouter);
apiRouter.use('/public/company-settings', companySettingsPublicRouter);
