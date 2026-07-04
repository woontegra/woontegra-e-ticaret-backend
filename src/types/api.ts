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
