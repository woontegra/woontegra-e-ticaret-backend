import { z } from 'zod';

const userRoleEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']);

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: userRoleEnum,
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: userRoleEnum.optional(),
  isActive: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: userRoleEnum.optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
