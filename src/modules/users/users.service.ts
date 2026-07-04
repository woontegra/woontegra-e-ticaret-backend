import type { User, UserRole } from '@prisma/client';
import { env } from '../../config/index.js';
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

type Actor = Pick<User, 'id' | 'role' | 'tenantId'>;

function resolveTenantId(actor: Actor, inputTenantId?: string | null): string | null {
  if (actor.role === 'SUPER_ADMIN') {
    if (inputTenantId === undefined) return null;
    return inputTenantId;
  }

  return actor.tenantId;
}

function assertRoleAssignment(actor: Actor, role: UserRole) {
  if (!canAssignRole(actor.role, role)) {
    throw AppError.forbidden('You cannot assign this role');
  }

  if (role !== 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    if (!actor.tenantId) {
      throw AppError.badRequest('Tenant is required for this role');
    }
  }

  if (role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw AppError.forbidden('Only super admins can create super admins');
  }
}

export async function listUsers(
  actor: Actor,
  query: { search?: string; role?: UserRole; isActive?: boolean },
) {
  const where = {
    ...(actor.role === 'SUPER_ADMIN'
      ? {}
      : { tenantId: actor.tenantId ?? undefined }),
    ...(query.role ? { role: query.role } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' as const } },
            { username: { contains: query.search, mode: 'insensitive' as const } },
            { firstName: { contains: query.search, mode: 'insensitive' as const } },
            { lastName: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { tenant: { select: { id: true, slug: true, name: true } } },
  });

  return toSafeUsers(users);
}

export async function getUserById(actor: Actor, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: { select: { id: true, slug: true, name: true } } },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  if (actor.role !== 'SUPER_ADMIN' && user.tenantId !== actor.tenantId) {
    throw AppError.forbidden('Access denied');
  }

  return toSafeUser(user);
}

export async function createUser(actor: Actor, input: CreateUserInput) {
  if (!canManageUsers(actor.role)) {
    throw AppError.forbidden('Access denied');
  }

  assertRoleAssignment(actor, input.role);

  let tenantId = resolveTenantId(actor, input.tenantId);

  if (
    actor.role === 'SUPER_ADMIN' &&
    !tenantId &&
    input.role !== 'SUPER_ADMIN'
  ) {
    const defaultTenant = await prisma.tenant.findUnique({
      where: { slug: env.DEFAULT_TENANT_SLUG },
    });
    tenantId = defaultTenant?.id ?? null;
  }

  if (input.role !== 'SUPER_ADMIN' && !tenantId) {
    throw AppError.badRequest('Tenant is required');
  }

  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant?.isActive) {
      throw AppError.badRequest('Invalid tenant');
    }
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        username: input.username.toLowerCase(),
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        tenantId: input.role === 'SUPER_ADMIN' ? null : tenantId,
        isActive: input.isActive ?? true,
      },
      include: { tenant: { select: { id: true, slug: true, name: true } } },
    });

    return toSafeUser(user);
  } catch {
    throw AppError.conflict('Email or username already exists');
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

  const tenantId =
    input.tenantId !== undefined
      ? resolveTenantId(actor, input.tenantId)
      : existing.tenantId;

  const nextRole = input.role ?? existing.role;

  if (nextRole !== 'SUPER_ADMIN' && !tenantId) {
    throw AppError.badRequest('Tenant is required');
  }

  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.username !== undefined
          ? { username: input.username.toLowerCase() }
          : {}),
        ...(input.email !== undefined
          ? { email: input.email.toLowerCase() }
          : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        tenantId: nextRole === 'SUPER_ADMIN' ? null : tenantId,
      },
      include: { tenant: { select: { id: true, slug: true, name: true } } },
    });

    return toSafeUser(user);
  } catch {
    throw AppError.conflict('Email or username already exists');
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
