import { AppError } from '../../lib/app-error.js';
import {
  toFooterColumnDto,
  toFooterLinkDtos,
} from '../../lib/footer-link.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateFooterColumnInput,
  UpdateFooterColumnInput,
} from './footer-column.schema.js';

async function getNextSortOrder() {
  const last = await prisma.footerColumn.findFirst({
    orderBy: { sortOrder: 'desc' },
  });

  return (last?.sortOrder ?? -1) + 1;
}

export async function listFooterColumns() {
  const columns = await prisma.footerColumn.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return columns.map((column) => toFooterColumnDto(column));
}

export async function getFooterColumnById(id: string) {
  const column = await prisma.footerColumn.findUnique({ where: { id } });

  if (!column) {
    throw AppError.notFound('Footer column not found');
  }

  const links = await prisma.footerLink.findMany({
    where: { columnId: id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const linkDtos = await toFooterLinkDtos(links);
  return toFooterColumnDto(column, linkDtos);
}

export async function createFooterColumn(input: CreateFooterColumnInput) {
  const sortOrder = input.sortOrder ?? (await getNextSortOrder());

  const column = await prisma.footerColumn.create({
    data: {
      title: input.title,
      sortOrder,
      isActive: input.isActive ?? true,
    },
  });

  return toFooterColumnDto(column, []);
}

export async function updateFooterColumn(
  id: string,
  input: UpdateFooterColumnInput,
) {
  const existing = await prisma.footerColumn.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Footer column not found');
  }

  const column = await prisma.footerColumn.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  const links = await prisma.footerLink.findMany({
    where: { columnId: id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const linkDtos = await toFooterLinkDtos(links);
  return toFooterColumnDto(column, linkDtos);
}

export async function deleteFooterColumn(id: string) {
  const existing = await prisma.footerColumn.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Footer column not found');
  }

  await prisma.footerColumn.delete({ where: { id } });
}
