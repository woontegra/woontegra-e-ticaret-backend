import { toInputJson } from '../../lib/json.js';
import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { DEFAULT_THEME_SETTINGS } from '../../lib/default-theme.js';
import { toThemeSettingDto } from '../../lib/theme.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { UpdateThemeSettingInput } from './theme-settings.schema.js';

async function getOrCreate() {
  return prisma.themeSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      activeThemeKey: DEFAULT_THEME_SETTINGS.activeThemeKey,
      colorPalette: toInputJson(DEFAULT_THEME_SETTINGS.colorPalette),
      typography: toInputJson(DEFAULT_THEME_SETTINGS.typography),
      layout: toInputJson(DEFAULT_THEME_SETTINGS.layout),
      buttonStyle: toInputJson(DEFAULT_THEME_SETTINGS.buttonStyle),
      cardStyle: toInputJson(DEFAULT_THEME_SETTINGS.cardStyle),
      headerStyle: toInputJson(DEFAULT_THEME_SETTINGS.headerStyle),
      productCardStyle: toInputJson(DEFAULT_THEME_SETTINGS.productCardStyle),
      borderRadius: DEFAULT_THEME_SETTINGS.borderRadius,
      shadowLevel: DEFAULT_THEME_SETTINGS.shadowLevel,
      containerWidth: DEFAULT_THEME_SETTINGS.containerWidth,
      customCss: DEFAULT_THEME_SETTINGS.customCss,
    },
  });
}

export async function getThemeSettings() {
  const setting = await getOrCreate();
  return toThemeSettingDto(setting);
}

export async function updateThemeSettings(input: UpdateThemeSettingInput) {
  const setting = await prisma.themeSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {
      ...(input.activeThemeKey !== undefined
        ? { activeThemeKey: input.activeThemeKey }
        : {}),
      ...(input.colorPalette !== undefined
        ? { colorPalette: toInputJson(input.colorPalette) }
        : {}),
      ...(input.typography !== undefined
        ? { typography: toInputJson(input.typography) }
        : {}),
      ...(input.layout !== undefined
        ? { layout: toInputJson(input.layout) }
        : {}),
      ...(input.buttonStyle !== undefined
        ? { buttonStyle: toInputJson(input.buttonStyle) }
        : {}),
      ...(input.cardStyle !== undefined
        ? { cardStyle: toInputJson(input.cardStyle) }
        : {}),
      ...(input.headerStyle !== undefined
        ? { headerStyle: toInputJson(input.headerStyle) }
        : {}),
      ...(input.productCardStyle !== undefined
        ? { productCardStyle: toInputJson(input.productCardStyle) }
        : {}),
      ...(input.borderRadius !== undefined
        ? { borderRadius: input.borderRadius }
        : {}),
      ...(input.shadowLevel !== undefined
        ? { shadowLevel: input.shadowLevel }
        : {}),
      ...(input.containerWidth !== undefined
        ? { containerWidth: input.containerWidth }
        : {}),
      ...(input.customCss !== undefined ? { customCss: input.customCss } : {}),
    },
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...DEFAULT_THEME_SETTINGS,
      colorPalette: toInputJson(DEFAULT_THEME_SETTINGS.colorPalette),
      typography: toInputJson(DEFAULT_THEME_SETTINGS.typography),
      layout: toInputJson(DEFAULT_THEME_SETTINGS.layout),
      buttonStyle: toInputJson(DEFAULT_THEME_SETTINGS.buttonStyle),
      cardStyle: toInputJson(DEFAULT_THEME_SETTINGS.cardStyle),
      headerStyle: toInputJson(DEFAULT_THEME_SETTINGS.headerStyle),
      productCardStyle: toInputJson(DEFAULT_THEME_SETTINGS.productCardStyle),
      ...input,
      ...(input.colorPalette !== undefined
        ? { colorPalette: toInputJson(input.colorPalette) }
        : {}),
      ...(input.typography !== undefined
        ? { typography: toInputJson(input.typography) }
        : {}),
      ...(input.layout !== undefined
        ? { layout: toInputJson(input.layout) }
        : {}),
      ...(input.buttonStyle !== undefined
        ? { buttonStyle: toInputJson(input.buttonStyle) }
        : {}),
      ...(input.cardStyle !== undefined
        ? { cardStyle: toInputJson(input.cardStyle) }
        : {}),
      ...(input.headerStyle !== undefined
        ? { headerStyle: toInputJson(input.headerStyle) }
        : {}),
      ...(input.productCardStyle !== undefined
        ? { productCardStyle: toInputJson(input.productCardStyle) }
        : {}),
    },
  });

  return toThemeSettingDto(setting);
}
