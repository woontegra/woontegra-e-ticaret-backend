import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';
import { sendErrors } from '../lib/response.js';
import { env } from '../config/index.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('AppError', {
        code: err.code,
        message: err.message,
        path: req.path,
        method: req.method,
      });
    }
    sendErrors(
      res,
      [{ code: err.code, message: err.message }],
      err.statusCode,
    );
    return;
  }

  if (err instanceof ZodError) {
    sendErrors(
      res,
      err.errors.map((issue) => ({
        code: 'VALIDATION_ERROR',
        message: issue.message,
        field: issue.path.join('.') || undefined,
      })),
      422,
    );
    return;
  }

  logger.error('Unhandled error', {
    path: req.path,
    method: req.method,
    error:
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : err,
  });

  const message =
    env.NODE_ENV === 'development' && err instanceof Error
      ? err.message
      : 'Internal server error';

  sendErrors(res, [{ code: 'INTERNAL_ERROR', message }], 500);
}
