import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import type { PublicFooterDto } from '../../types/api.js';
import {
  toFooterColumnDto,
  toFooterLinkDtos,
  toPublicFooterColumnDto,
} from '../../lib/footer-link.mapper.js';
import { toFooterSettingDto } from '../../lib/footer.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { UpdateFooterSettingInput } from './footer-setting.schema.js';

async function getOrCreateSetting() {
  return prisma.footerSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: { id: SETTINGS_SINGLETON_ID },
  });
}

export async function getFooterSettings() {
  const setting = await getOrCreateSetting();
  return toFooterSettingDto(setting);
}

export async function updateFooterSettings(input: UpdateFooterSettingInput) {
  const setting = await prisma.footerSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {
      ...(input.logoMediaId !== undefined
        ? { logoMediaId: input.logoMediaId }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.showNewsletter !== undefined
        ? { showNewsletter: input.showNewsletter }
        : {}),
      ...(input.newsletterTitle !== undefined
        ? { newsletterTitle: input.newsletterTitle }
        : {}),
      ...(input.newsletterDescription !== undefined
        ? { newsletterDescription: input.newsletterDescription }
        : {}),
      ...(input.newsletterPlaceholder !== undefined
        ? { newsletterPlaceholder: input.newsletterPlaceholder }
        : {}),
      ...(input.newsletterButtonLabel !== undefined
        ? { newsletterButtonLabel: input.newsletterButtonLabel }
        : {}),
      ...(input.newsletterSuccessMessage !== undefined
        ? { newsletterSuccessMessage: input.newsletterSuccessMessage }
        : {}),
      ...(input.copyrightText !== undefined
        ? { copyrightText: input.copyrightText }
        : {}),
      ...(input.socialLinks !== undefined
        ? { socialLinks: input.socialLinks }
        : {}),
      ...(input.paymentIconIds !== undefined
        ? { paymentIconIds: input.paymentIconIds }
        : {}),
      ...(input.shippingIconIds !== undefined
        ? { shippingIconIds: input.shippingIconIds }
        : {}),
    },
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...input,
    },
  });

  return toFooterSettingDto(setting);
}

export async function getPublicFooter(): Promise<PublicFooterDto> {
  const [setting, columns, links] = await Promise.all([
    getOrCreateSetting(),
    prisma.footerColumn.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.footerLink.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const settingDto = await toFooterSettingDto(setting);
  const linksByColumn = new Map<string, typeof links>();

  for (const link of links) {
    const columnLinks = linksByColumn.get(link.columnId) ?? [];
    columnLinks.push(link);
    linksByColumn.set(link.columnId, columnLinks);
  }

  const publicColumns = (
    await Promise.all(
      columns.map((column) =>
        toPublicFooterColumnDto(column, linksByColumn.get(column.id) ?? []),
      ),
    )
  ).filter(Boolean) as PublicFooterDto['columns'];

  return {
    logoUrl: settingDto.logoUrl,
    description: settingDto.description,
    phone: settingDto.phone,
    email: settingDto.email,
    address: settingDto.address,
    showNewsletter: settingDto.showNewsletter,
    newsletterTitle: settingDto.newsletterTitle,
    newsletterDescription: settingDto.newsletterDescription,
    newsletterPlaceholder: settingDto.newsletterPlaceholder,
    newsletterButtonLabel: settingDto.newsletterButtonLabel,
    newsletterSuccessMessage: settingDto.newsletterSuccessMessage,
    copyrightText: settingDto.copyrightText,
    socialLinks: settingDto.socialLinks,
    paymentIcons: settingDto.paymentIcons,
    shippingIcons: settingDto.shippingIcons,
    columns: publicColumns,
  };
}

export async function listFooterColumnsWithLinks() {
  const [columns, links] = await Promise.all([
    prisma.footerColumn.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.footerLink.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const linkDtos = await toFooterLinkDtos(links);
  const linksByColumn = new Map<string, typeof linkDtos>();

  for (const link of linkDtos) {
    const columnLinks = linksByColumn.get(link.columnId) ?? [];
    columnLinks.push(link);
    linksByColumn.set(link.columnId, columnLinks);
  }

  return columns.map((column) =>
    toFooterColumnDto(column, linksByColumn.get(column.id) ?? []),
  );
}
