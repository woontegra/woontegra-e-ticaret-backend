import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@prisma/client';
import { AppError } from '../lib/app-error.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

export interface AuthMiddlewareOptions {
  required?: boolean;
}

export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const { required = true } = options;

  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      if (required) {
        throw AppError.unauthorized('Authentication token required');
      }
      return next();
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      throw AppError.unauthorized('Invalid authentication token');
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw AppError.unauthorized('Account is inactive or not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  });
}

export const requireAuth = authMiddleware({ required: true });
export const optionalAuth = authMiddleware({ required: false });

export function requireRoles(...roles: UserRole[]) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  });
}
