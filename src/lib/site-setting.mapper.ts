import type { SiteSetting } from '@prisma/client';
import type { SiteSettingDto } from '../types/api.js';
import { resolveMediaUrl } from './media-url.js';

export function toSiteSettingDto(setting: SiteSetting): SiteSettingDto {
  return {
    id: setting.id,
    siteName: setting.siteName,
    siteDescription: setting.siteDescription,
    defaultSeoTitle: setting.defaultSeoTitle,
    defaultSeoDescription: setting.defaultSeoDescription,
    domain: setting.domain,
    maintenanceMode: setting.maintenanceMode,
    logoMediaId: setting.logoMediaId,
    faviconMediaId: setting.faviconMediaId,
    ogImageMediaId: setting.ogImageMediaId,
    logoUrl: resolveMediaUrl(setting.logoMediaId),
    faviconUrl: resolveMediaUrl(setting.faviconMediaId),
    ogImageUrl: resolveMediaUrl(setting.ogImageMediaId),
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}
