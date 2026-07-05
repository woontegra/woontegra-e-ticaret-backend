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
  headerHeight: '4rem',
  stickyHeader: true,
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
  accountUrl: '/giris',
  searchPlaceholder: 'Ürün veya yazılım ara…',
  cartUrl: '/sepet',
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
