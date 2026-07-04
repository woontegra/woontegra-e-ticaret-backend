import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export function toSafeUsers(users: User[]): SafeUser[] {
  return users.map(toSafeUser);
}
