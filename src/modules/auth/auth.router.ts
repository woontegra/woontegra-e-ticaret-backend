import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(authController.login));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));
