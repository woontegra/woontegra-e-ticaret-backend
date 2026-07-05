import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRoles } from '../../middlewares/authorize.middleware.js';
import { ROLE_USER_MANAGERS } from '../../lib/role-groups.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as usersController from './users.controller.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get(
  '/',
  requireRoles(...ROLE_USER_MANAGERS),
  asyncHandler(usersController.listUsers),
);

usersRouter.get(
  '/:id',
  requireRoles(...ROLE_USER_MANAGERS),
  asyncHandler(usersController.getUser),
);

usersRouter.post(
  '/',
  requireRoles(...ROLE_USER_MANAGERS),
  asyncHandler(usersController.createUser),
);

usersRouter.patch(
  '/:id',
  requireRoles(...ROLE_USER_MANAGERS),
  asyncHandler(usersController.updateUser),
);

usersRouter.delete(
  '/:id',
  requireRoles(...ROLE_USER_MANAGERS),
  asyncHandler(usersController.deleteUser),
);
