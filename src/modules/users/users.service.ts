import type { User, UserRole } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { hashPassword } from '../../lib/password.js';
import {
  assertCanManageTargetUser,
  canAssignRole,
  canManageUsers,
} from '../../lib/roles.js';
import { toSafeUser, toSafeUsers } from '../../lib/user.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateUserInput,
  UpdateUserInput,
} from './users.schema.js';

type Actor = Pick<User, 'id' | 'role'>;

function assertRoleAssignment(actor: Actor, role: UserRole) {
  if (!canAssignRole(actor.role, role)) {
    throw AppError.forbidden('You cannot assign this role');
  }
}

export async function listUsers(
  actor: Actor,
  query: { search?: string; role?: UserRole; isActive?: boolean },
) {
  const where = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' as const } },
            { name: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return toSafeUsers(users);
}

export async function getUserById(actor: Actor, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return toSafeUser(user);
}

export async function createUser(actor: Actor, input: CreateUserInput) {
  if (!canManageUsers(actor.role)) {
    throw AppError.forbidden('Access denied');
  }

  assertRoleAssignment(actor, input.role);

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
        isActive: input.isActive ?? true,
      },
    });

    return toSafeUser(user);
  } catch {
    throw AppError.conflict('Email already exists');
  }
}

export async function updateUser(
  actor: Actor,
  userId: string,
  input: UpdateUserInput,
) {
  if (!canManageUsers(actor.role)) {
    throw AppError.forbidden('Access denied');
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw AppError.notFound('User not found');
  }

  try {
    assertCanManageTargetUser(actor, existing);
  } catch {
    throw AppError.forbidden('Access denied');
  }

  if (input.role) {
    assertRoleAssignment(actor, input.role);
  }

  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.email !== undefined
          ? { email: input.email.toLowerCase() }
          : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });

    return toSafeUser(user);
  } catch {
    throw AppError.conflict('Email already exists');
  }
}

export async function deleteUser(actor: Actor, userId: string) {
  if (!canManageUsers(actor.role)) {
    throw AppError.forbidden('Access denied');
  }

  if (actor.id === userId) {
    throw AppError.badRequest('You cannot delete your own account');
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw AppError.notFound('User not found');
  }

  try {
    assertCanManageTargetUser(actor, existing);
  } catch {
    throw AppError.forbidden('Access denied');
  }

  await prisma.user.delete({ where: { id: userId } });

  return { success: true };
}
