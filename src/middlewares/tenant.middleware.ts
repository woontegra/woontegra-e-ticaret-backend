import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/index.js';
import { AppError } from '../lib/app-error.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

export interface TenantMiddlewareOptions {
  required?: boolean;
}

/**
 * Tenant çözümleme middleware iskeleti.
 * Öncelik: X-Tenant-Slug header → X-Tenant-Id header → DEFAULT_TENANT_SLUG
 */
export function tenantMiddleware(options: TenantMiddlewareOptions = {}) {
  const { required = true } = options;

  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const slugHeader = req.headers['x-tenant-slug'];
    const idHeader = req.headers['x-tenant-id'];

    const slug =
      typeof slugHeader === 'string' && slugHeader.length > 0
        ? slugHeader
        : env.DEFAULT_TENANT_SLUG;

    let tenant = null;

    if (typeof idHeader === 'string' && idHeader.length > 0) {
      tenant = await prisma.tenant.findFirst({
        where: { id: idHeader, isActive: true },
        select: { id: true, slug: true, name: true },
      });
    } else {
      tenant = await prisma.tenant.findFirst({
        where: { slug, isActive: true },
        select: { id: true, slug: true, name: true },
      });
    }

    if (!tenant) {
      if (required) {
        throw AppError.notFound('Tenant not found or inactive', 'TENANT_NOT_FOUND');
      }
      return next();
    }

    req.tenant = tenant;
    next();
  });
}

export const requireTenant = tenantMiddleware({ required: true });
export const optionalTenant = tenantMiddleware({ required: false });
