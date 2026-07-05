import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';

export interface TenantMiddlewareOptions {
  required?: boolean;
}

/** Tek site modeli — tenant çözümlemesi kullanılmaz. */
export function tenantMiddleware(_options: TenantMiddlewareOptions = {}) {
  return asyncHandler(async (_req: Request, _res: Response, next: NextFunction) => {
    next();
  });
}

export const requireTenant = tenantMiddleware({ required: true });
export const optionalTenant = tenantMiddleware({ required: false });
