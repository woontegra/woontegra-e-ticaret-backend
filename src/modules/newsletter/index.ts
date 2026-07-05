import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import * as newsletterController from './newsletter.controller.js';

export const newsletterPublicRouter = Router();

newsletterPublicRouter.post(
  '/subscribe',
  asyncHandler(newsletterController.subscribe),
);
