import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as footerController from './footer.controller.js';

export const footerSettingsAdminRouter = Router();
export const footerColumnsAdminRouter = Router();
export const footerLinksAdminRouter = Router();
export const footerPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'OWNER', 'ADMIN');

footerSettingsAdminRouter.use(requireAuth, adminRoles);
footerSettingsAdminRouter.get('/', asyncHandler(footerController.getFooterSettings));
footerSettingsAdminRouter.put(
  '/',
  asyncHandler(footerController.updateFooterSettings),
);

footerColumnsAdminRouter.use(requireAuth, adminRoles);
footerColumnsAdminRouter.get(
  '/with-links',
  asyncHandler(footerController.listFooterColumnsWithLinks),
);
footerColumnsAdminRouter.get('/', asyncHandler(footerController.listFooterColumns));
footerColumnsAdminRouter.post('/', asyncHandler(footerController.createFooterColumn));
footerColumnsAdminRouter.get('/:id', asyncHandler(footerController.getFooterColumn));
footerColumnsAdminRouter.put('/:id', asyncHandler(footerController.updateFooterColumn));
footerColumnsAdminRouter.delete(
  '/:id',
  asyncHandler(footerController.deleteFooterColumn),
);
footerColumnsAdminRouter.get(
  '/:columnId/links',
  asyncHandler(footerController.listFooterLinks),
);
footerColumnsAdminRouter.post(
  '/:columnId/links',
  asyncHandler(footerController.createFooterLink),
);

footerLinksAdminRouter.use(requireAuth, adminRoles);
footerLinksAdminRouter.put('/:id', asyncHandler(footerController.updateFooterLink));
footerLinksAdminRouter.delete('/:id', asyncHandler(footerController.deleteFooterLink));

footerPublicRouter.get('/', asyncHandler(footerController.getPublicFooter));
