import { AppError } from '../../lib/app-error.js';
import { signCustomerAccessToken } from '../../lib/customer-jwt.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { prisma } from '../../lib/prisma.js';
import type { CustomerLoginInput, CustomerRegisterInput } from './customer-auth.schema.js';

function toSafeCustomer(customer: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
}) {
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
  };
}

export async function registerCustomer(input: CustomerRegisterInput) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.storeCustomer.findUnique({ where: { email } });

  if (existing) {
    throw AppError.conflict('Bu e-posta adresi zaten kayıtlı');
  }

  const passwordHash = await hashPassword(input.password);
  const customer = await prisma.storeCustomer.create({
    data: {
      email,
      passwordHash,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
    },
  });

  const accessToken = signCustomerAccessToken({
    sub: customer.id,
    email: customer.email,
    name: customer.name,
  });

  return { accessToken, customer: toSafeCustomer(customer) };
}

export async function loginCustomer(input: CustomerLoginInput) {
  const email = input.email.trim().toLowerCase();
  const customer = await prisma.storeCustomer.findUnique({ where: { email } });

  if (!customer || !customer.isActive) {
    throw AppError.unauthorized('E-posta veya şifre hatalı');
  }

  const valid = await verifyPassword(input.password, customer.passwordHash);
  if (!valid) {
    throw AppError.unauthorized('E-posta veya şifre hatalı');
  }

  await prisma.storeCustomer.update({
    where: { id: customer.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = signCustomerAccessToken({
    sub: customer.id,
    email: customer.email,
    name: customer.name,
  });

  return { accessToken, customer: toSafeCustomer(customer) };
}

export async function getCustomerMe(customerId: string) {
  const customer = await prisma.storeCustomer.findUnique({
    where: { id: customerId },
    select: { id: true, email: true, name: true, phone: true, isActive: true },
  });

  if (!customer || !customer.isActive) {
    throw AppError.unauthorized('Hesap bulunamadı');
  }

  return toSafeCustomer(customer);
}
