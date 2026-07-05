import type {
  ThemeButtonStyle,
  ThemeCardStyle,
  ThemeColorPalette,
  ThemeHeaderStyle,
  ThemeLayoutSettings,
  ThemeProductCardStyle,
  ThemeTypography,
} from '../types/api.js';

export const DEFAULT_THEME_KEY = 'default';

export const DEFAULT_COLOR_PALETTE: ThemeColorPalette = {
  primary: '#0f172a',
  secondary: '#64748b',
  accent: '#0f172a',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

export const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  headingFontFamily: 'Inter, system-ui, sans-serif',
  baseFontSize: 14,
  headingWeight: 600,
  lineHeight: 1.5,
};

export const DEFAULT_LAYOUT: ThemeLayoutSettings = {
  mobilePadding: '1rem',
  sectionSpacing: '2rem',
  compactNav: true,
  mobileFontSize: 14,
  mobileHeaderHeight: '3rem',
};

export const DEFAULT_BUTTON_STYLE: ThemeButtonStyle = {
  borderRadius: '0.375rem',
  paddingX: '1rem',
  paddingY: '0.5rem',
  fontWeight: 500,
  primaryBg: '#0f172a',
  primaryText: '#ffffff',
  primaryHoverBg: '#1e293b',
};

export const DEFAULT_CARD_STYLE: ThemeCardStyle = {
  borderRadius: '0.5rem',
  borderColor: '#e2e8f0',
  background: '#ffffff',
  shadow: 'sm',
  padding: '1rem',
};

export const DEFAULT_HEADER_STYLE: ThemeHeaderStyle = {
  background: '#ffffff',
  textColor: '#64748b',
  textHoverColor: '#0f172a',
  borderColor: '#e2e8f0',
  height: '3.5rem',
  sticky: false,
};

export const DEFAULT_PRODUCT_CARD_STYLE: ThemeProductCardStyle = {
  borderRadius: '0.5rem',
  imageRatio: '1/1',
  showBadge: true,
  priceColor: '#0f172a',
  titleSize: '1rem',
};

export const DEFAULT_THEME_SETTINGS = {
  activeThemeKey: DEFAULT_THEME_KEY,
  colorPalette: DEFAULT_COLOR_PALETTE,
  typography: DEFAULT_TYPOGRAPHY,
  layout: DEFAULT_LAYOUT,
  buttonStyle: DEFAULT_BUTTON_STYLE,
  cardStyle: DEFAULT_CARD_STYLE,
  headerStyle: DEFAULT_HEADER_STYLE,
  productCardStyle: DEFAULT_PRODUCT_CARD_STYLE,
  borderRadius: 'md',
  shadowLevel: 'sm',
  containerWidth: '1280px',
  customCss: null as string | null,
};
