import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/index.js';
import { AppError } from './app-error.js';

export interface CustomerAccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  type: 'customer_access';
}

export function signCustomerAccessToken(
  payload: Omit<CustomerAccessTokenPayload, 'type'>,
): string {
  const options = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions;

  return jwt.sign({ ...payload, type: 'customer_access' }, env.JWT_SECRET, options);
}

export function verifyCustomerAccessToken(
  token: string,
): CustomerAccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as CustomerAccessTokenPayload;

    if (decoded.type !== 'customer_access') {
      throw AppError.unauthorized('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unauthorized('Invalid or expired token');
  }
}
