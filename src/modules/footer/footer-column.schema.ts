import { z } from 'zod';

export const createFooterColumnSchema = z.object({
  title: z.string().min(1).max(200),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateFooterColumnSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateFooterColumnInput = z.infer<typeof createFooterColumnSchema>;
export type UpdateFooterColumnInput = z.infer<typeof updateFooterColumnSchema>;
