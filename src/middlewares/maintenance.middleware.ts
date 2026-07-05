import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/app-error.js';
import { SETTINGS_SINGLETON_ID } from '../types/api.js';
import { asyncHandler } from '../utils/async-handler.js';

export const publicMaintenanceGuard = asyncHandler(
  async (_req: Request, _res: Response, next: NextFunction) => {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: SETTINGS_SINGLETON_ID },
      select: { maintenanceMode: true },
    });

    if (settings?.maintenanceMode) {
      throw AppError.serviceUnavailable(
        'Site is temporarily under maintenance.',
      );
    }

    next();
  },
);
