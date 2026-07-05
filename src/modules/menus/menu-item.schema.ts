import { MenuItemType } from '@prisma/client';
import { z } from 'zod';

export const createMenuItemSchema = z.object({
  parentId: z.string().nullable().optional(),
  label: z.string().min(1).max(120),
  type: z.nativeEnum(MenuItemType),
  targetId: z.string().nullable().optional(),
  url: z.string().max(500).nullable().optional(),
  openInNewTab: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const reorderMenuItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.number().int(),
      parentId: z.string().nullable().optional(),
    }),
  ),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type ReorderMenuItemsInput = z.infer<typeof reorderMenuItemsSchema>;
