import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as pagesController from './pages.controller.js';

export const pagesAdminRouter = Router();

pagesAdminRouter.use(requireAuth);
pagesAdminRouter.use(requireRoles('SUPER_ADMIN', 'OWNER', 'ADMIN'));

pagesAdminRouter.get('/', asyncHandler(pagesController.listPages));
pagesAdminRouter.post('/', asyncHandler(pagesController.createPage));
pagesAdminRouter.get('/:id', asyncHandler(pagesController.getPage));
pagesAdminRouter.put('/:id', asyncHandler(pagesController.updatePage));
pagesAdminRouter.delete('/:id', asyncHandler(pagesController.deletePage));
pagesAdminRouter.post('/:id/publish', asyncHandler(pagesController.publishPage));
pagesAdminRouter.post('/:id/unpublish', asyncHandler(pagesController.unpublishPage));

export const pagesPublicRouter = Router();

pagesPublicRouter.get('/:slug', asyncHandler(pagesController.getPublicPage));
