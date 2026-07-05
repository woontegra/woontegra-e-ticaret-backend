import { MenuLocation } from '@prisma/client';
import { z } from 'zod';

export const createMenuSchema = z.object({
  name: z.string().min(1).max(120),
  location: z.nativeEnum(MenuLocation),
  isActive: z.boolean().optional(),
});

export const updateMenuSchema = createMenuSchema.partial();

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
