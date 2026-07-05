import type { Menu, MenuItem } from '@prisma/client';
import type {
  MenuDto,
  MenuItemDto,
  MenuLocation,
  PublicMenuDto,
  PublicMenuItemDto,
} from '../types/api.js';
import { resolveMenuItemHref, resolveMenuItemHrefs } from './menu-resolver.js';

type MenuItemWithChildren = MenuItem & { children?: MenuItemWithChildren[] };

export function toMenuDto(menu: Menu): MenuDto {
  return {
    id: menu.id,
    name: menu.name,
    location: menu.location,
    isActive: menu.isActive,
    createdAt: menu.createdAt.toISOString(),
    updatedAt: menu.updatedAt.toISOString(),
  };
}

function buildItemTree(items: MenuItem[]): MenuItemWithChildren[] {
  const map = new Map<string, MenuItemWithChildren>();
  const roots: MenuItemWithChildren[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: MenuItemWithChildren[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const node of nodes) {
      if (node.children?.length) sortNodes(node.children);
    }
  };

  sortNodes(roots);
  return roots;
}

export async function toMenuItemDto(
  item: MenuItem,
  hrefMap?: Map<string, string | null>,
): Promise<MenuItemDto> {
  const href =
    hrefMap?.get(item.id) ?? (await resolveMenuItemHref(item));

  return {
    id: item.id,
    menuId: item.menuId,
    parentId: item.parentId,
    label: item.label,
    type: item.type,
    targetId: item.targetId,
    url: item.url,
    href,
    openInNewTab: item.openInNewTab,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function toMenuItemTreeDtos(
  items: MenuItem[],
): Promise<MenuItemDto[]> {
  const hrefMap = await resolveMenuItemHrefs(items);
  const tree = buildItemTree(items);

  async function mapNode(node: MenuItemWithChildren): Promise<MenuItemDto> {
    const dto = await toMenuItemDto(node, hrefMap);
    if (node.children?.length) {
      dto.children = await Promise.all(node.children.map(mapNode));
    }
    return dto;
  }

  return Promise.all(tree.map(mapNode));
}

export async function toPublicMenuItemDto(
  item: MenuItemWithChildren,
  hrefMap: Map<string, string | null>,
): Promise<PublicMenuItemDto | null> {
  const href = hrefMap.get(item.id);
  if (!href) return null;

  const children = item.children?.length
    ? (
        await Promise.all(
          item.children.map((child) => toPublicMenuItemDto(child, hrefMap)),
        )
      ).filter(Boolean) as PublicMenuItemDto[]
    : [];

  return {
    id: item.id,
    label: item.label,
    href,
    openInNewTab: item.openInNewTab,
    children,
  };
}

export async function toPublicMenuDto(
  menu: Menu,
  items: MenuItem[],
): Promise<PublicMenuDto | null> {
  if (!menu.isActive) return null;

  const activeItems = items.filter((item) => item.isActive);
  const hrefMap = await resolveMenuItemHrefs(activeItems);
  const tree = buildItemTree(activeItems);

  const publicItems = (
    await Promise.all(
      tree.map((node) => toPublicMenuItemDto(node, hrefMap)),
    )
  ).filter(Boolean) as PublicMenuItemDto[];

  return {
    id: menu.id,
    name: menu.name,
    location: menu.location as MenuLocation,
    items: publicItems,
  };
}
