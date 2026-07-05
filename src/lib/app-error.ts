export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code = 'APP_ERROR',
    details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown) {
    return new AppError(400, message, code, details);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new AppError(401, message, code);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(403, message, code);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new AppError(404, message, code);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new AppError(409, message, code);
  }

  static tooManyRequests(message = 'Too many requests', code = 'RATE_LIMITED') {
    return new AppError(429, message, code);
  }

  static serviceUnavailable(
    message = 'Service unavailable',
    code = 'SERVICE_UNAVAILABLE',
  ) {
    return new AppError(503, message, code);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new AppError(500, message, code);
  }
}
