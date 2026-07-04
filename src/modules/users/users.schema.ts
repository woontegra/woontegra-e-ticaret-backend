import { z } from 'zod';

const userRoleEnum = z.enum(['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']);

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid username format'),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: userRoleEnum,
  tenantId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid username format')
    .optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  role: userRoleEnum.optional(),
  tenantId: z.string().cuid().optional().nullable(),
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
