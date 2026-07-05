import rateLimit from 'express-rate-limit';
import { AppError } from '../lib/app-error.js';

function rateLimitHandler() {
  throw AppError.tooManyRequests('Too many requests. Please try again later.');
}

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const publicWriteRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
