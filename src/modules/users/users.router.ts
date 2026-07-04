import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRoles } from '../../middlewares/authorize.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as usersController from './users.controller.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get(
  '/',
  requireRoles('SUPER_ADMIN', 'OWNER', 'ADMIN'),
  asyncHandler(usersController.listUsers),
);

usersRouter.get(
  '/:id',
  requireRoles('SUPER_ADMIN', 'OWNER', 'ADMIN'),
  asyncHandler(usersController.getUser),
);

usersRouter.post(
  '/',
  requireRoles('SUPER_ADMIN', 'OWNER'),
  asyncHandler(usersController.createUser),
);

usersRouter.patch(
  '/:id',
  requireRoles('SUPER_ADMIN', 'OWNER'),
  asyncHandler(usersController.updateUser),
);

usersRouter.delete(
  '/:id',
  requireRoles('SUPER_ADMIN', 'OWNER'),
  asyncHandler(usersController.deleteUser),
);
