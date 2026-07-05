import type { FooterSetting } from '@prisma/client';
import type {
  FooterMediaIconDto,
  FooterSettingDto,
  SocialLinks,
} from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';
import { prisma } from './prisma.js';

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function parseSocialLinks(value: unknown): SocialLinks {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as SocialLinks;
}

async function resolveMediaIcons(
  ids: string[],
): Promise<FooterMediaIconDto[]> {
  if (ids.length === 0) return [];

  const urlMap = await resolveMediaUrlMap(ids);
  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: ids } },
    select: { id: true, altText: true },
  });

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return ids
    .map((id) => {
      const url = urlMap.get(id);
      if (!url) return null;

      const asset = assetMap.get(id);
      return {
        id,
        url,
        altText: asset?.altText ?? null,
      };
    })
    .filter(Boolean) as FooterMediaIconDto[];
}

export async function toFooterSettingDto(
  setting: FooterSetting,
): Promise<FooterSettingDto> {
  const paymentIconIds = parseStringArray(setting.paymentIconIds);
  const shippingIconIds = parseStringArray(setting.shippingIconIds);
  const mediaIds = [
    setting.logoMediaId,
    ...paymentIconIds,
    ...shippingIconIds,
  ].filter(Boolean) as string[];

  const urlMap = await resolveMediaUrlMap(mediaIds);
  const [paymentIcons, shippingIcons] = await Promise.all([
    resolveMediaIcons(paymentIconIds),
    resolveMediaIcons(shippingIconIds),
  ]);

  return {
    id: setting.id,
    logoMediaId: setting.logoMediaId,
    logoUrl: setting.logoMediaId
      ? (urlMap.get(setting.logoMediaId) ?? null)
      : null,
    description: setting.description,
    phone: setting.phone,
    email: setting.email,
    address: setting.address,
    showNewsletter: setting.showNewsletter,
    newsletterTitle: setting.newsletterTitle,
    newsletterDescription: setting.newsletterDescription,
    newsletterPlaceholder: setting.newsletterPlaceholder,
    newsletterButtonLabel: setting.newsletterButtonLabel,
    newsletterSuccessMessage: setting.newsletterSuccessMessage,
    copyrightText: setting.copyrightText,
    socialLinks: parseSocialLinks(setting.socialLinks),
    paymentIconIds,
    shippingIconIds,
    paymentIcons,
    shippingIcons,
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}

export { parseSocialLinks, parseStringArray, resolveMediaIcons };
