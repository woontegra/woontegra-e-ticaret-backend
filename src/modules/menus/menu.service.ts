import { MenuLocation } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import {
  toMenuDto,
  toMenuItemTreeDtos,
  toPublicMenuDto,
} from '../../lib/menu.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateMenuInput, UpdateMenuInput } from './menu.schema.js';

export async function listMenus() {
  const menus = await prisma.menu.findMany({ orderBy: { location: 'asc' } });
  return menus.map(toMenuDto);
}

export async function getMenuById(id: string) {
  const menu = await prisma.menu.findUnique({ where: { id } });

  if (!menu) {
    throw AppError.notFound('Menu not found');
  }

  return toMenuDto(menu);
}

export async function getMenuByLocation(location: MenuLocation) {
  const menu = await prisma.menu.findUnique({ where: { location } });

  if (!menu) {
    throw AppError.notFound('Menu not found');
  }

  return toMenuDto(menu);
}

export async function getOrCreateMenuByLocation(location: MenuLocation) {
  const names: Record<MenuLocation, string> = {
    HEADER: 'Header Menüsü',
    FOOTER: 'Footer Menüsü',
    MOBILE: 'Mobil Menü',
  };

  const menu = await prisma.menu.upsert({
    where: { location },
    update: {},
    create: {
      name: names[location],
      location,
      isActive: true,
    },
  });

  return toMenuDto(menu);
}

export async function createMenu(input: CreateMenuInput) {
  try {
    const menu = await prisma.menu.create({ data: input });
    return toMenuDto(menu);
  } catch {
    throw AppError.conflict('Menu for this location already exists');
  }
}

export async function updateMenu(id: string, input: UpdateMenuInput) {
  const existing = await prisma.menu.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Menu not found');
  }

  try {
    const menu = await prisma.menu.update({
      where: { id },
      data: input,
    });

    return toMenuDto(menu);
  } catch {
    throw AppError.conflict('Menu for this location already exists');
  }
}

export async function deleteMenu(id: string) {
  const existing = await prisma.menu.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Menu not found');
  }

  await prisma.menu.delete({ where: { id } });
}

export async function listMenuItems(menuId: string) {
  const menu = await prisma.menu.findUnique({ where: { id: menuId } });

  if (!menu) {
    throw AppError.notFound('Menu not found');
  }

  const items = await prisma.menuItem.findMany({
    where: { menuId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return toMenuItemTreeDtos(items);
}

export async function getPublicMenus() {
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    include: {
      items: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  const result = {
    header: null as Awaited<ReturnType<typeof toPublicMenuDto>>,
    footer: null as Awaited<ReturnType<typeof toPublicMenuDto>>,
    mobile: null as Awaited<ReturnType<typeof toPublicMenuDto>>,
  };

  for (const menu of menus) {
    const publicMenu = await toPublicMenuDto(menu, menu.items);
    if (!publicMenu) continue;

    if (menu.location === 'HEADER') result.header = publicMenu;
    if (menu.location === 'FOOTER') result.footer = publicMenu;
    if (menu.location === 'MOBILE') result.mobile = publicMenu;
  }

  return result;
}
