import { z } from 'zod';

const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

const colorPaletteSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  background: hexColor,
  surface: hexColor,
  text: hexColor,
  textMuted: hexColor,
  border: hexColor,
});

const typographySchema = z.object({
  fontFamily: z.string().min(1).max(200),
  headingFontFamily: z.string().min(1).max(200),
  baseFontSize: z.number().int().min(10).max(24),
  headingWeight: z.number().int().min(400).max(900),
  lineHeight: z.number().min(1).max(2.5),
});

const layoutSchema = z.object({
  mobilePadding: z.string().max(50),
  sectionSpacing: z.string().max(50),
  compactNav: z.boolean(),
  mobileFontSize: z.number().int().min(10).max(24),
  mobileHeaderHeight: z.string().max(50),
});

const buttonStyleSchema = z.object({
  borderRadius: z.string().max(50),
  paddingX: z.string().max(50),
  paddingY: z.string().max(50),
  fontWeight: z.number().int().min(400).max(900),
  primaryBg: hexColor,
  primaryText: hexColor,
  primaryHoverBg: hexColor,
});

const cardStyleSchema = z.object({
  borderRadius: z.string().max(50),
  borderColor: hexColor,
  background: hexColor,
  shadow: z.enum(['none', 'sm', 'md', 'lg']),
  padding: z.string().max(50),
});

const headerStyleSchema = z.object({
  background: hexColor,
  textColor: hexColor,
  textHoverColor: hexColor,
  borderColor: hexColor,
  height: z.string().max(50),
  sticky: z.boolean(),
});

const productCardStyleSchema = z.object({
  borderRadius: z.string().max(50),
  imageRatio: z.string().max(20),
  showBadge: z.boolean(),
  priceColor: hexColor,
  titleSize: z.string().max(50),
});

export const updateThemeSettingSchema = z.object({
  activeThemeKey: z.string().min(1).max(100).optional(),
  colorPalette: colorPaletteSchema.optional(),
  typography: typographySchema.optional(),
  layout: layoutSchema.optional(),
  buttonStyle: buttonStyleSchema.optional(),
  cardStyle: cardStyleSchema.optional(),
  headerStyle: headerStyleSchema.optional(),
  productCardStyle: productCardStyleSchema.optional(),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  shadowLevel: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  containerWidth: z.string().max(50).optional(),
  customCss: z.string().max(10000).nullable().optional(),
});

export type UpdateThemeSettingInput = z.infer<typeof updateThemeSettingSchema>;

export {
  buttonStyleSchema,
  cardStyleSchema,
  colorPaletteSchema,
  headerStyleSchema,
  layoutSchema,
  productCardStyleSchema,
  typographySchema,
};
