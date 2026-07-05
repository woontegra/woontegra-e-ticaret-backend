import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as menuController from './menu.controller.js';

export const menusAdminRouter = Router();
export const menuItemsAdminRouter = Router();
export const menusPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'OWNER', 'ADMIN');

menusAdminRouter.use(requireAuth, adminRoles);
menusAdminRouter.get('/', asyncHandler(menuController.listMenus));
menusAdminRouter.post('/', asyncHandler(menuController.createMenu));
menusAdminRouter.get(
  '/location/:location',
  asyncHandler(menuController.getMenuByLocation),
);
menusAdminRouter.get('/:menuId/items', asyncHandler(menuController.listMenuItems));
menusAdminRouter.post(
  '/:menuId/items',
  asyncHandler(menuController.createMenuItem),
);
menusAdminRouter.put(
  '/:menuId/items/reorder',
  asyncHandler(menuController.reorderMenuItems),
);
menusAdminRouter.get('/:id', asyncHandler(menuController.getMenu));
menusAdminRouter.put('/:id', asyncHandler(menuController.updateMenu));
menusAdminRouter.delete('/:id', asyncHandler(menuController.deleteMenu));

menuItemsAdminRouter.use(requireAuth, adminRoles);
menuItemsAdminRouter.put('/:id', asyncHandler(menuController.updateMenuItem));
menuItemsAdminRouter.delete('/:id', asyncHandler(menuController.deleteMenuItem));

menusPublicRouter.get('/', asyncHandler(menuController.getPublicMenus));
