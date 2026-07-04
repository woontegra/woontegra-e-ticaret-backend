import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
        tenantId: string | null;
      };
      tenant?: {
        id: string;
        slug: string;
        name: string;
      };
    }
  }
}

export {};
