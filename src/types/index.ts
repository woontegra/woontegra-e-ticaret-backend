export type { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
  type: 'access' | 'refresh';
}
