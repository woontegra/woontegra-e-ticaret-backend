import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/app-error.js';
import { verifyCustomerAccessToken } from '../lib/customer-jwt.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

export function customerAuthMiddleware(options: { required?: boolean } = {}) {
  const { required = true } = options;

  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      if (required) {
        throw AppError.unauthorized('Müşteri oturumu gerekli');
      }
      return next();
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw AppError.unauthorized('Geçersiz müşteri oturumu');
    }

    const payload = verifyCustomerAccessToken(token);
    const customer = await prisma.storeCustomer.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
      },
    });

    if (!customer || !customer.isActive) {
      throw AppError.unauthorized('Hesap bulunamadı veya pasif');
    }

    req.customer = customer;
    next();
  });
}

export const requireCustomerAuth = customerAuthMiddleware({ required: true });
export const optionalCustomerAuth = customerAuthMiddleware({ required: false });
