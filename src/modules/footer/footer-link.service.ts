import { AppError } from '../../lib/app-error.js';
import { toFooterLinkDto } from '../../lib/footer-link.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateFooterLinkInput,
  UpdateFooterLinkInput,
} from './footer-link.schema.js';

async function getNextSortOrder(columnId: string) {
  const last = await prisma.footerLink.findFirst({
    where: { columnId },
    orderBy: { sortOrder: 'desc' },
  });

  return (last?.sortOrder ?? -1) + 1;
}

export async function listFooterLinks(columnId: string) {
  const column = await prisma.footerColumn.findUnique({
    where: { id: columnId },
  });

  if (!column) {
    throw AppError.notFound('Footer column not found');
  }

  const links = await prisma.footerLink.findMany({
    where: { columnId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return Promise.all(links.map((link) => toFooterLinkDto(link)));
}

export async function createFooterLink(
  columnId: string,
  input: CreateFooterLinkInput,
) {
  const column = await prisma.footerColumn.findUnique({
    where: { id: columnId },
  });

  if (!column) {
    throw AppError.notFound('Footer column not found');
  }

  const sortOrder = input.sortOrder ?? (await getNextSortOrder(columnId));

  const link = await prisma.footerLink.create({
    data: {
      columnId,
      label: input.label,
      type: input.type,
      targetId: input.targetId ?? null,
      url: input.url ?? null,
      sortOrder,
      isActive: input.isActive ?? true,
      openInNewTab: input.openInNewTab ?? false,
    },
  });

  return toFooterLinkDto(link);
}

export async function updateFooterLink(id: string, input: UpdateFooterLinkInput) {
  const existing = await prisma.footerLink.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Footer link not found');
  }

  const link = await prisma.footerLink.update({
    where: { id },
    data: {
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.targetId !== undefined ? { targetId: input.targetId } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.openInNewTab !== undefined
        ? { openInNewTab: input.openInNewTab }
        : {}),
    },
  });

  return toFooterLinkDto(link);
}

export async function deleteFooterLink(id: string) {
  const existing = await prisma.footerLink.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Footer link not found');
  }

  await prisma.footerLink.delete({ where: { id } });
}
