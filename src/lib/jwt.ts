import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '../config/index.js';
import { AppError } from './app-error.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  tenantId: string | null;
  type: 'access';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const options = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions;

  return jwt.sign({ ...payload, type: 'access' }, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

    if (decoded.type !== 'access') {
      throw AppError.unauthorized('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unauthorized('Invalid or expired token');
  }
}
