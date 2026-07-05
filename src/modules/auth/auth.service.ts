import { AppError } from '../../lib/app-error.js';
import { signAccessToken } from '../../lib/jwt.js';
import { verifyPassword } from '../../lib/password.js';
import { toSafeUser } from '../../lib/user.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { LoginInput } from './auth.schema.js';

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    accessToken,
    user: toSafeUser({ ...user, lastLoginAt: new Date() }),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('User not found or inactive');
  }

  return toSafeUser(user);
}

export async function logout() {
  return { success: true };
}
