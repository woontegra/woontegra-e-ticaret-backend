import type { HeaderSetting } from '@prisma/client';
import type { HeaderSettingDto } from '../types/api.js';

export function toHeaderSettingDto(setting: HeaderSetting): HeaderSettingDto {
  return {
    id: setting.id,
    logoPosition: setting.logoPosition,
    menuPosition: setting.menuPosition,
    headerHeight: setting.headerHeight,
    stickyHeader: setting.stickyHeader,
    showSearch: setting.showSearch,
    showAccountIcon: setting.showAccountIcon,
    showFavoritesIcon: setting.showFavoritesIcon,
    showCartIcon: setting.showCartIcon,
    topBarEnabled: setting.topBarEnabled,
    topBarText: setting.topBarText,
    topBarBackground: setting.topBarBackground,
    topBarTextColor: setting.topBarTextColor,
    announcementEnabled: setting.announcementEnabled,
    announcementText: setting.announcementText,
    announcementLink: setting.announcementLink,
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}
