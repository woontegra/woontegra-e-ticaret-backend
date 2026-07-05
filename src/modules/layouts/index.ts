import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as layoutController from './layout.controller.js';

export const layoutsAdminRouter = Router();
export const layoutsPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');

layoutsAdminRouter.use(requireAuth, adminRoles);
layoutsAdminRouter.get('/home/draft', asyncHandler(layoutController.getHomeDraft));
layoutsAdminRouter.put('/home/draft', asyncHandler(layoutController.updateHomeDraft));
layoutsAdminRouter.post('/:id/blocks', asyncHandler(layoutController.createBlock));
layoutsAdminRouter.put(
  '/:layoutId/blocks/:blockId',
  asyncHandler(layoutController.updateBlock),
);
layoutsAdminRouter.delete(
  '/:layoutId/blocks/:blockId',
  asyncHandler(layoutController.deleteBlock),
);
layoutsAdminRouter.post('/:id/reorder', asyncHandler(layoutController.reorderBlocks));
layoutsAdminRouter.post('/:id/publish', asyncHandler(layoutController.publishLayout));

layoutsPublicRouter.get('/home', asyncHandler(layoutController.getPublicHomeLayout));
