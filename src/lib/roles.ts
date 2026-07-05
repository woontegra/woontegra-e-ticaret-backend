import type { UserRole } from '@prisma/client';

const ROLE_RANK: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  EDITOR: 2,
  STAFF: 1,
};

export function canManageUsers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function canViewUsers(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function canAssignRole(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  if (actorRole === 'SUPER_ADMIN') return true;
  if (actorRole === 'ADMIN') {
    return targetRole !== 'SUPER_ADMIN';
  }
  return false;
}

export function hasMinimumRole(role: UserRole, minimum: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function assertCanManageTargetUser(
  actor: { id: string; role: UserRole },
  target: { id: string; role: UserRole },
): void {
  if (actor.id === target.id) return;

  if (actor.role === 'SUPER_ADMIN') return;

  if (actor.role === 'ADMIN') {
    if (target.role === 'SUPER_ADMIN') {
      throw new Error('FORBIDDEN');
    }
    return;
  }

  throw new Error('FORBIDDEN');
}
