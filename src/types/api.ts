/** API response envelope */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorItem {
  code: string;
  message: string;
  field?: string;
}

export interface ApiErrorResponse {
  errors: ApiErrorItem[];
}

export const SETTINGS_SINGLETON_ID = 'default';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface SiteSettingDto {
  id: string;
  siteName: string;
  siteDescription: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  domain: string;
  maintenanceMode: boolean;
  logoMediaId: string | null;
  faviconMediaId: string | null;
  ogImageMediaId: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettingDto {
  id: string;
  companyName: string;
  tradeName: string;
  taxNumber: string;
  taxOffice: string;
  mersisNumber: string | null;
  address: string;
  city: string;
  district: string;
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  workingHours: string;
  currency: string;
  defaultTaxRate: number;
  socialLinks: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetDto {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  storageKey: string;
  folder: string;
  altText: string | null;
  title: string | null;
  usageType: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListResult {
  items: MediaAssetDto[];
  total: number;
}

export type PageStatus = 'DRAFT' | 'PUBLISHED';
export type PageType = 'STANDARD' | 'LEGAL' | 'LANDING';

export interface PageDto {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  pageType: PageType;
  excerpt: string | null;
  contentHtml: string;
  blocksJson: unknown | null;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  publishedAt: string | null;
  createdById: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageListResult {
  items: PageDto[];
  total: number;
}

export interface BlogCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  coverImageId: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  category: BlogCategoryDto | null;
  status: PageStatus;
  authorName: string | null;
  readingTime: number | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImageUrl: string | null;
  robotsIndex: boolean;
  publishedAt: string | null;
  createdById: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListResult {
  items: BlogPostDto[];
  total: number;
  page?: number;
  limit?: number;
}

export type MenuLocation = 'HEADER' | 'FOOTER' | 'MOBILE';
export type MenuItemType =
  | 'PAGE'
  | 'CATEGORY'
  | 'PRODUCT'
  | 'BLOG'
  | 'CUSTOM_URL';

export interface MenuDto {
  id: string;
  name: string;
  location: MenuLocation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemDto {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  type: MenuItemType;
  targetId: string | null;
  url: string | null;
  href: string | null;
  openInNewTab: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: MenuItemDto[];
}

export interface PublicMenuItemDto {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  children: PublicMenuItemDto[];
}

export interface PublicMenuDto {
  id: string;
  name: string;
  location: MenuLocation;
  items: PublicMenuItemDto[];
}

export interface PublicMenusDto {
  header: PublicMenuDto | null;
  footer: PublicMenuDto | null;
  mobile: PublicMenuDto | null;
}

export interface ReorderMenuItemsInput {
  items: Array<{
    id: string;
    sortOrder: number;
    parentId?: string | null;
  }>;
}

export interface FooterMediaIconDto {
  id: string;
  url: string;
  altText: string | null;
}

export interface FooterSettingDto {
  id: string;
  logoMediaId: string | null;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  showNewsletter: boolean;
  copyrightText: string | null;
  socialLinks: SocialLinks;
  paymentIconIds: string[];
  shippingIconIds: string[];
  paymentIcons: FooterMediaIconDto[];
  shippingIcons: FooterMediaIconDto[];
  createdAt: string;
  updatedAt: string;
}

export interface FooterColumnDto {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
  links?: FooterLinkDto[];
  createdAt: string;
  updatedAt: string;
}

export interface FooterLinkDto {
  id: string;
  columnId: string;
  label: string;
  type: MenuItemType;
  targetId: string | null;
  url: string | null;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFooterLinkDto {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
}

export interface PublicFooterColumnDto {
  id: string;
  title: string;
  links: PublicFooterLinkDto[];
}

export interface PublicFooterDto {
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  showNewsletter: boolean;
  copyrightText: string | null;
  socialLinks: SocialLinks;
  paymentIcons: FooterMediaIconDto[];
  shippingIcons: FooterMediaIconDto[];
  columns: PublicFooterColumnDto[];
}

export interface ThemeColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number;
  headingWeight: number;
  lineHeight: number;
}

export interface ThemeLayoutSettings {
  mobilePadding: string;
  sectionSpacing: string;
  compactNav: boolean;
  mobileFontSize: number;
  mobileHeaderHeight: string;
}

export interface ThemeButtonStyle {
  borderRadius: string;
  paddingX: string;
  paddingY: string;
  fontWeight: number;
  primaryBg: string;
  primaryText: string;
  primaryHoverBg: string;
}

export interface ThemeCardStyle {
  borderRadius: string;
  borderColor: string;
  background: string;
  shadow: string;
  padding: string;
}

export interface ThemeHeaderStyle {
  background: string;
  textColor: string;
  textHoverColor: string;
  borderColor: string;
  height: string;
  sticky: boolean;
}

export interface ThemeProductCardStyle {
  borderRadius: string;
  imageRatio: string;
  showBadge: boolean;
  priceColor: string;
  titleSize: string;
}

export interface ThemeSettingDto {
  id: string;
  activeThemeKey: string;
  colorPalette: ThemeColorPalette;
  typography: ThemeTypography;
  layout: ThemeLayoutSettings;
  buttonStyle: ThemeButtonStyle;
  cardStyle: ThemeCardStyle;
  headerStyle: ThemeHeaderStyle;
  productCardStyle: ThemeProductCardStyle;
  borderRadius: string;
  shadowLevel: string;
  containerWidth: string;
  customCss: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PublicThemeSettingDto = ThemeSettingDto;

export type HeaderLogoPosition = 'LEFT' | 'CENTER';
export type HeaderMenuPosition = 'LEFT' | 'CENTER' | 'RIGHT';

export interface HeaderSettingDto {
  id: string;
  logoPosition: HeaderLogoPosition;
  menuPosition: HeaderMenuPosition;
  headerHeight: string;
  stickyHeader: boolean;
  showSearch: boolean;
  showAccountIcon: boolean;
  showFavoritesIcon: boolean;
  showCartIcon: boolean;
  topBarEnabled: boolean;
  topBarText: string | null;
  topBarBackground: string | null;
  topBarTextColor: string | null;
  announcementEnabled: boolean;
  announcementText: string | null;
  announcementLink: string | null;
  createdAt: string;
  updatedAt: string;
}
