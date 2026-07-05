import type { ThemeSetting } from '@prisma/client';
import type {
  ThemeButtonStyle,
  ThemeCardStyle,
  ThemeColorPalette,
  ThemeHeaderStyle,
  ThemeLayoutSettings,
  ThemeProductCardStyle,
  ThemeSettingDto,
  ThemeTypography,
} from '../types/api.js';
import { DEFAULT_THEME_SETTINGS } from './default-theme.js';

function mergeJson<T extends object>(value: unknown, defaults: T): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaults;
  }

  return { ...defaults, ...(value as Partial<T>) };
}

export function toThemeSettingDto(setting: ThemeSetting): ThemeSettingDto {
  return {
    id: setting.id,
    activeThemeKey: setting.activeThemeKey,
    colorPalette: mergeJson<ThemeColorPalette>(
      setting.colorPalette,
      DEFAULT_THEME_SETTINGS.colorPalette,
    ),
    typography: mergeJson<ThemeTypography>(
      setting.typography,
      DEFAULT_THEME_SETTINGS.typography,
    ),
    layout: mergeJson<ThemeLayoutSettings>(
      setting.layout,
      DEFAULT_THEME_SETTINGS.layout,
    ),
    buttonStyle: mergeJson<ThemeButtonStyle>(
      setting.buttonStyle,
      DEFAULT_THEME_SETTINGS.buttonStyle,
    ),
    cardStyle: mergeJson<ThemeCardStyle>(
      setting.cardStyle,
      DEFAULT_THEME_SETTINGS.cardStyle,
    ),
    headerStyle: mergeJson<ThemeHeaderStyle>(
      setting.headerStyle,
      DEFAULT_THEME_SETTINGS.headerStyle,
    ),
    productCardStyle: mergeJson<ThemeProductCardStyle>(
      setting.productCardStyle,
      DEFAULT_THEME_SETTINGS.productCardStyle,
    ),
    borderRadius: setting.borderRadius,
    shadowLevel: setting.shadowLevel,
    containerWidth: setting.containerWidth,
    customCss: setting.customCss,
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}
