import type {
  HeaderLogoPosition,
  HeaderMenuPosition,
  HeaderSettingDto,
} from '../types/api.js';

export const DEFAULT_HEADER_SETTINGS: Omit<
  HeaderSettingDto,
  'id' | 'createdAt' | 'updatedAt'
> = {
  logoPosition: 'LEFT',
  menuPosition: 'CENTER',
  headerHeight: '3.5rem',
  stickyHeader: false,
  showSearch: true,
  showAccountIcon: true,
  showFavoritesIcon: false,
  showCartIcon: true,
  topBarEnabled: false,
  topBarText: null,
  topBarBackground: '#0f172a',
  topBarTextColor: '#ffffff',
  announcementEnabled: false,
  announcementText: null,
  announcementLink: null,
  accountUrl: null,
  searchPlaceholder: null,
  cartUrl: null,
  favoritesUrl: null,
};

export const HEADER_LOGO_POSITION_LABELS: Record<HeaderLogoPosition, string> = {
  LEFT: 'Sol',
  CENTER: 'Orta',
};

export const HEADER_MENU_POSITION_LABELS: Record<HeaderMenuPosition, string> = {
  LEFT: 'Sol',
  CENTER: 'Orta',
  RIGHT: 'Sağ',
};
