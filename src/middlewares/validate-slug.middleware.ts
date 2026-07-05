import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/app-error.js';
import { isValidSlug } from '../lib/slug.js';
import { asyncHandler } from '../utils/async-handler.js';

export function validateSlugParam(paramName = 'slug') {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const raw = req.params[paramName];
    if (!raw || !isValidSlug(raw)) {
      throw AppError.notFound('Resource not found');
    }
    next();
  });
}
