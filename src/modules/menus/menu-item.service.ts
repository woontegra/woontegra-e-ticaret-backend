import { AppError } from '../../lib/app-error.js';
import { toMenuItemDto } from '../../lib/menu.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateMenuItemInput,
  ReorderMenuItemsInput,
  UpdateMenuItemInput,
} from './menu-item.schema.js';

async function getNextSortOrder(menuId: string, parentId: string | null) {
  const last = await prisma.menuItem.findFirst({
    where: { menuId, parentId },
    orderBy: { sortOrder: 'desc' },
  });

  return (last?.sortOrder ?? -1) + 1;
}

async function validateParent(menuId: string, parentId: string | null) {
  if (!parentId) return;

  const parent = await prisma.menuItem.findFirst({
    where: { id: parentId, menuId },
  });

  if (!parent) {
    throw AppError.badRequest('Invalid parent menu item');
  }
}

export async function createMenuItem(
  menuId: string,
  input: CreateMenuItemInput,
) {
  const menu = await prisma.menu.findUnique({ where: { id: menuId } });

  if (!menu) {
    throw AppError.notFound('Menu not found');
  }

  const parentId = input.parentId ?? null;
  await validateParent(menuId, parentId);

  const sortOrder =
    input.sortOrder ?? (await getNextSortOrder(menuId, parentId));

  const item = await prisma.menuItem.create({
    data: {
      menuId,
      parentId,
      label: input.label,
      type: input.type,
      targetId: input.targetId ?? null,
      url: input.url ?? null,
      openInNewTab: input.openInNewTab ?? false,
      sortOrder,
      isActive: input.isActive ?? true,
    },
  });

  return toMenuItemDto(item);
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput) {
  const existing = await prisma.menuItem.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Menu item not found');
  }

  if (input.parentId !== undefined && input.parentId === id) {
    throw AppError.badRequest('Menu item cannot be its own parent');
  }

  if (input.parentId !== undefined) {
    await validateParent(existing.menuId, input.parentId);
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.targetId !== undefined ? { targetId: input.targetId } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.openInNewTab !== undefined
        ? { openInNewTab: input.openInNewTab }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toMenuItemDto(item);
}

export async function deleteMenuItem(id: string) {
  const existing = await prisma.menuItem.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Menu item not found');
  }

  await prisma.menuItem.delete({ where: { id } });
}

export async function reorderMenuItems(
  menuId: string,
  input: ReorderMenuItemsInput,
) {
  const menu = await prisma.menu.findUnique({ where: { id: menuId } });

  if (!menu) {
    throw AppError.notFound('Menu not found');
  }

  const itemIds = input.items.map((item) => item.id);
  const existingItems = await prisma.menuItem.findMany({
    where: { menuId, id: { in: itemIds } },
  });

  if (existingItems.length !== itemIds.length) {
    throw AppError.badRequest('Invalid menu item ids');
  }

  for (const item of input.items) {
    if (item.parentId) {
      await validateParent(menuId, item.parentId);
    }
  }

  await prisma.$transaction(
    input.items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: {
          sortOrder: item.sortOrder,
          parentId: item.parentId ?? null,
        },
      }),
    ),
  );

  const items = await prisma.menuItem.findMany({
    where: { menuId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const { toMenuItemTreeDtos } = await import('../../lib/menu.mapper.js');
  return toMenuItemTreeDtos(items);
}
