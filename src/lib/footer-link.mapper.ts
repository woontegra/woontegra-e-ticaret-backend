import type { FooterColumn, FooterLink } from '@prisma/client';
import type {
  FooterColumnDto,
  FooterLinkDto,
  PublicFooterColumnDto,
  PublicFooterLinkDto,
} from '../types/api.js';
import { resolveMenuItemHref, resolveMenuItemHrefs } from './menu-resolver.js';

export function toFooterColumnDto(
  column: FooterColumn,
  links?: FooterLinkDto[],
): FooterColumnDto {
  return {
    id: column.id,
    title: column.title,
    sortOrder: column.sortOrder,
    isActive: column.isActive,
    ...(links ? { links } : {}),
    createdAt: column.createdAt.toISOString(),
    updatedAt: column.updatedAt.toISOString(),
  };
}

export async function toFooterLinkDto(
  link: FooterLink,
  hrefMap?: Map<string, string | null>,
): Promise<FooterLinkDto> {
  const href =
    hrefMap?.get(link.id) ?? (await resolveMenuItemHref(link));

  return {
    id: link.id,
    columnId: link.columnId,
    label: link.label,
    type: link.type,
    targetId: link.targetId,
    url: link.url,
    href,
    sortOrder: link.sortOrder,
    isActive: link.isActive,
    openInNewTab: link.openInNewTab,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
  };
}

export async function toFooterLinkDtos(
  links: FooterLink[],
): Promise<FooterLinkDto[]> {
  const hrefMap = await resolveMenuItemHrefs(
    links.map((link) => ({
      id: link.id,
      type: link.type,
      targetId: link.targetId,
      url: link.url,
    })),
  );

  return Promise.all(links.map((link) => toFooterLinkDto(link, hrefMap)));
}

export async function toPublicFooterLinkDto(
  link: FooterLink,
  hrefMap: Map<string, string | null>,
): Promise<PublicFooterLinkDto | null> {
  const href = hrefMap.get(link.id);
  if (!href) return null;

  return {
    id: link.id,
    label: link.label,
    href,
    openInNewTab: link.openInNewTab,
  };
}

export async function toPublicFooterColumnDto(
  column: FooterColumn,
  links: FooterLink[],
): Promise<PublicFooterColumnDto | null> {
  if (!column.isActive) return null;

  const activeLinks = links.filter((link) => link.isActive);
  const hrefMap = await resolveMenuItemHrefs(
    activeLinks.map((link) => ({
      id: link.id,
      type: link.type,
      targetId: link.targetId,
      url: link.url,
    })),
  );

  const publicLinks = (
    await Promise.all(
      activeLinks.map((link) => toPublicFooterLinkDto(link, hrefMap)),
    )
  ).filter(Boolean) as PublicFooterLinkDto[];

  return {
    id: column.id,
    title: column.title,
    links: publicLinks,
  };
}
