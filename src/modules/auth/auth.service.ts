import { AppError } from '../../lib/app-error.js';
import { signAccessToken } from '../../lib/jwt.js';
import { verifyPassword } from '../../lib/password.js';
import { toSafeUser } from '../../lib/user.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { LoginInput } from './auth.schema.js';

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { tenant: { select: { id: true, slug: true, name: true, isActive: true } } },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  if (user.tenant && !user.tenant.isActive) {
    throw AppError.forbidden('Tenant is inactive');
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    tenantId: user.tenantId,
  });

  return {
    accessToken,
    user: toSafeUser(user),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: { select: { id: true, slug: true, name: true } } },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('User not found or inactive');
  }

  return toSafeUser(user);
}

export async function logout() {
  return { success: true };
}
