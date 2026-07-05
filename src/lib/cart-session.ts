import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';

export const CART_SESSION_COOKIE = 'woontegra_cart_session';
const CART_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function resolveCartSessionId(req: Request, res: Response): string {
  const existing = req.cookies?.[CART_SESSION_COOKIE] as string | undefined;

  if (existing) {
    return existing;
  }

  const sessionId = randomUUID();
  res.cookie(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CART_SESSION_MAX_AGE_MS,
  });

  return sessionId;
}

export function clearCartSessionCookie(res: Response) {
  res.clearCookie(CART_SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
