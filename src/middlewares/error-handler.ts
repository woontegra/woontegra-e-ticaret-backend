import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/app-error.js';
import { sendErrors } from '../lib/response.js';
import { env } from '../config/index.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
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

  if (env.NODE_ENV === 'development') {
    console.error('[api] Unhandled error:', err);
  }

  sendErrors(
    res,
    [{ code: 'INTERNAL_ERROR', message: 'Internal server error' }],
    500,
  );
}
