import type { SiteSetting } from '@prisma/client';
import type { SiteSettingDto } from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

export async function toSiteSettingDto(
  setting: SiteSetting,
): Promise<SiteSettingDto> {
  const urlMap = await resolveMediaUrlMap([
    setting.logoMediaId,
    setting.faviconMediaId,
    setting.ogImageMediaId,
  ]);

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
    logoUrl: setting.logoMediaId
      ? (urlMap.get(setting.logoMediaId) ?? null)
      : null,
    faviconUrl: setting.faviconMediaId
      ? (urlMap.get(setting.faviconMediaId) ?? null)
      : null,
    ogImageUrl: setting.ogImageMediaId
      ? (urlMap.get(setting.ogImageMediaId) ?? null)
      : null,
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}
