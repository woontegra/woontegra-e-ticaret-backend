import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
      };
      customer?: {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        isActive: boolean;
      };
    }
  }
}

export {};
