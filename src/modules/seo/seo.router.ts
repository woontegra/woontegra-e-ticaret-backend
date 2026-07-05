import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as seoController from './seo.controller.js';

export const seoAdminRouter = Router();
export const seoPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');

seoPublicRouter.get('/seo-settings', asyncHandler(seoController.getPublicSeoSettings));

seoAdminRouter.use(requireAuth, adminRoles);
seoAdminRouter.get('/seo-settings', asyncHandler(seoController.getSeoSettings));
seoAdminRouter.put('/seo-settings', asyncHandler(seoController.updateSeoSettings));
seoAdminRouter.get('/redirect-rules', asyncHandler(seoController.listRedirectRules));
seoAdminRouter.post('/redirect-rules', asyncHandler(seoController.createRedirectRule));
seoAdminRouter.put(
  '/redirect-rules/:id',
  asyncHandler(seoController.updateRedirectRule),
);
seoAdminRouter.delete(
  '/redirect-rules/:id',
  asyncHandler(seoController.deleteRedirectRule),
);

export { serveRobotsTxt, serveSitemapXml } from './seo.controller.js';
