import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import * as downloadsController from './downloads.controller.js';

export const downloadsRouter = Router();

downloadsRouter.get(
  '/free/:productSlug/:fileType',
  asyncHandler(downloadsController.downloadFree),
);

downloadsRouter.get(
  '/order/:token',
  asyncHandler(downloadsController.downloadPaid),
);
