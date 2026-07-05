import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { DEFAULT_HEADER_SETTINGS } from '../../lib/default-header.js';
import { toHeaderSettingDto } from '../../lib/header.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { UpdateHeaderSettingInput } from './header-settings.schema.js';

async function getOrCreate() {
  return prisma.headerSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...DEFAULT_HEADER_SETTINGS,
    },
  });
}

export async function getHeaderSettings() {
  const setting = await getOrCreate();
  return toHeaderSettingDto(setting);
}

export async function updateHeaderSettings(input: UpdateHeaderSettingInput) {
  const setting = await prisma.headerSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {
      ...(input.logoPosition !== undefined
        ? { logoPosition: input.logoPosition }
        : {}),
      ...(input.menuPosition !== undefined
        ? { menuPosition: input.menuPosition }
        : {}),
      ...(input.headerHeight !== undefined
        ? { headerHeight: input.headerHeight }
        : {}),
      ...(input.stickyHeader !== undefined
        ? { stickyHeader: input.stickyHeader }
        : {}),
      ...(input.showSearch !== undefined ? { showSearch: input.showSearch } : {}),
      ...(input.showAccountIcon !== undefined
        ? { showAccountIcon: input.showAccountIcon }
        : {}),
      ...(input.showFavoritesIcon !== undefined
        ? { showFavoritesIcon: input.showFavoritesIcon }
        : {}),
      ...(input.showCartIcon !== undefined
        ? { showCartIcon: input.showCartIcon }
        : {}),
      ...(input.topBarEnabled !== undefined
        ? { topBarEnabled: input.topBarEnabled }
        : {}),
      ...(input.topBarText !== undefined ? { topBarText: input.topBarText } : {}),
      ...(input.topBarBackground !== undefined
        ? { topBarBackground: input.topBarBackground }
        : {}),
      ...(input.topBarTextColor !== undefined
        ? { topBarTextColor: input.topBarTextColor }
        : {}),
      ...(input.announcementEnabled !== undefined
        ? { announcementEnabled: input.announcementEnabled }
        : {}),
      ...(input.announcementText !== undefined
        ? { announcementText: input.announcementText }
        : {}),
      ...(input.announcementLink !== undefined
        ? { announcementLink: input.announcementLink }
        : {}),
      ...(input.accountUrl !== undefined ? { accountUrl: input.accountUrl } : {}),
      ...(input.searchPlaceholder !== undefined
        ? { searchPlaceholder: input.searchPlaceholder }
        : {}),
      ...(input.cartUrl !== undefined ? { cartUrl: input.cartUrl } : {}),
      ...(input.favoritesUrl !== undefined
        ? { favoritesUrl: input.favoritesUrl }
        : {}),
    },
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...DEFAULT_HEADER_SETTINGS,
      ...input,
    },
  });

  return toHeaderSettingDto(setting);
}
