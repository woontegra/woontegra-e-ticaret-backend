import type { UserRole } from '@prisma/client';

const ROLE_RANK: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  OWNER: 3,
  ADMIN: 2,
  STAFF: 1,
};

export function canManageUsers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'OWNER';
}

export function canViewUsers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN';
}

export function canAssignRole(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  if (actorRole === 'SUPER_ADMIN') return true;
  if (actorRole === 'OWNER') {
    return targetRole === 'ADMIN' || targetRole === 'STAFF';
  }
  return false;
}

export function hasMinimumRole(role: UserRole, minimum: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function assertCanManageTargetUser(
  actor: { id: string; role: UserRole; tenantId: string | null },
  target: { id: string; role: UserRole; tenantId: string | null },
): void {
  if (actor.id === target.id) return;

  if (actor.role === 'SUPER_ADMIN') return;

  if (actor.role === 'OWNER') {
    if (target.role === 'SUPER_ADMIN') {
      throw new Error('FORBIDDEN');
    }
    if (target.tenantId !== actor.tenantId) {
      throw new Error('FORBIDDEN');
    }
    return;
  }

  throw new Error('FORBIDDEN');
}
