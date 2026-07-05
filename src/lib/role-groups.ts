import type { UserRole } from '@prisma/client';

export const ROLE_SETTINGS: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];
export const ROLE_CONTENT: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];
export const ROLE_OPERATIONS: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
export const ROLE_PANEL: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'];
export const ROLE_USER_MANAGERS: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];
export const ROLE_AUDIT_VIEWERS: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];
