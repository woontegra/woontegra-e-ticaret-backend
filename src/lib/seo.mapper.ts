import type { RedirectRule, SeoSetting } from '@prisma/client';
import type {
  RedirectRuleDto,
  SeoSettingDto,
  SeoSettingPublicDto,
} from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

export async function toSeoSettingDto(setting: SeoSetting): Promise<SeoSettingDto> {
  const urlMap = await resolveMediaUrlMap([setting.defaultOgImageId]);

  return {
    id: setting.id,
    defaultTitle: setting.defaultTitle,
    defaultDescription: setting.defaultDescription,
    defaultOgImageId: setting.defaultOgImageId,
    defaultOgImageUrl: setting.defaultOgImageId
      ? (urlMap.get(setting.defaultOgImageId) ?? null)
      : null,
    robotsTxt: setting.robotsTxt,
    googleAnalyticsId: setting.googleAnalyticsId,
    metaPixelId: setting.metaPixelId,
    canonicalBaseUrl: setting.canonicalBaseUrl,
    sitemapIncludeProducts: setting.sitemapIncludeProducts,
    sitemapIncludeCategories: setting.sitemapIncludeCategories,
    sitemapIncludePages: setting.sitemapIncludePages,
    sitemapIncludeBlogPosts: setting.sitemapIncludeBlogPosts,
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}

export async function toSeoSettingPublicDto(
  setting: SeoSetting,
): Promise<SeoSettingPublicDto> {
  const dto = await toSeoSettingDto(setting);
  return {
    defaultTitle: dto.defaultTitle,
    defaultDescription: dto.defaultDescription,
    defaultOgImageUrl: dto.defaultOgImageUrl,
    googleAnalyticsId: dto.googleAnalyticsId,
    metaPixelId: dto.metaPixelId,
    canonicalBaseUrl: dto.canonicalBaseUrl,
  };
}

export function toRedirectRuleDto(rule: RedirectRule): RedirectRuleDto {
  return {
    id: rule.id,
    sourcePath: rule.sourcePath,
    targetPath: rule.targetPath,
    statusCode: rule.statusCode as 301 | 302,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) return `/${path}`;
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

export { normalizePath };
