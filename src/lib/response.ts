import type { Response } from 'express';
import type { ApiErrorItem, ApiResponse } from '../types/api.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>,
): void {
  const body: ApiResponse<T> = meta ? { data, meta } : { data };
  res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendErrors(
  res: Response,
  errors: ApiErrorItem[],
  statusCode = 400,
): void {
  res.status(statusCode).json({ errors });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  field?: string,
): void {
  sendErrors(res, [{ code, message, ...(field ? { field } : {}) }], statusCode);
}
