import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  .nullable();

export const updateHeaderSettingSchema = z.object({
  logoPosition: z.enum(['LEFT', 'CENTER']).optional(),
  menuPosition: z.enum(['LEFT', 'CENTER', 'RIGHT']).optional(),
  headerHeight: z.string().min(1).max(50).optional(),
  stickyHeader: z.boolean().optional(),
  showSearch: z.boolean().optional(),
  showAccountIcon: z.boolean().optional(),
  showFavoritesIcon: z.boolean().optional(),
  showCartIcon: z.boolean().optional(),
  topBarEnabled: z.boolean().optional(),
  topBarText: z.string().max(500).nullable().optional(),
  topBarBackground: hexColor.optional(),
  topBarTextColor: hexColor.optional(),
  announcementEnabled: z.boolean().optional(),
  announcementText: z.string().max(500).nullable().optional(),
  announcementLink: z.string().max(2000).nullable().optional(),
});

export type UpdateHeaderSettingInput = z.infer<typeof updateHeaderSettingSchema>;
