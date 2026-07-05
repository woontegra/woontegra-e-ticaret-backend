import type { MenuItem, MenuItemType } from '@prisma/client';
import { PageStatus } from '@prisma/client';
import { prisma } from './prisma.js';

export async function resolveMenuItemHref(
  item: Pick<MenuItem, 'type' | 'targetId' | 'url'>,
): Promise<string | null> {
  switch (item.type) {
    case 'CUSTOM_URL':
      return item.url?.trim() || null;

    case 'PAGE': {
      if (!item.targetId) return null;
      const page = await prisma.page.findFirst({
        where: { id: item.targetId, status: PageStatus.PUBLISHED },
        select: { slug: true },
      });
      return page ? `/sayfa/${page.slug}` : null;
    }

    case 'BLOG': {
      if (!item.targetId) return null;
      const post = await prisma.blogPost.findFirst({
        where: { id: item.targetId, status: PageStatus.PUBLISHED },
        select: { slug: true },
      });
      return post ? `/blog/${post.slug}` : null;
    }

    case 'CATEGORY': {
      if (!item.targetId) return null;
      const category = await prisma.blogCategory.findFirst({
        where: { id: item.targetId, isActive: true },
        select: { slug: true },
      });
      return category ? `/blog?category=${category.slug}` : null;
    }

    case 'PRODUCT_CATEGORY': {
      if (!item.targetId) return null;
      const category = await prisma.productCategory.findFirst({
        where: { id: item.targetId, isActive: true },
        select: { slug: true },
      });
      return category ? `/kategori/${category.slug}` : null;
    }

    case 'PRODUCT': {
      if (!item.targetId) return null;
      const product = await prisma.product.findFirst({
        where: { id: item.targetId, status: 'ACTIVE' },
        select: { slug: true, productKind: true },
      });
      if (!product) return null;
      return product.productKind === 'SOFTWARE'
        ? `/yazilim/${product.slug}`
        : `/urun/${product.slug}`;
    }

    default:
      return null;
  }
}

export async function resolveMenuItemHrefs(
  items: Array<Pick<MenuItem, 'id' | 'type' | 'targetId' | 'url'>>,
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();

  await Promise.all(
    items.map(async (item) => {
      map.set(item.id, await resolveMenuItemHref(item));
    }),
  );

  return map;
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export const MENU_ITEM_TYPE_LABELS: Record<MenuItemType, string> = {
  PAGE: 'Sayfa',
  CATEGORY: 'Blog kategorisi',
  PRODUCT_CATEGORY: 'Ürün kategorisi',
  PRODUCT: 'Ürün',
  BLOG: 'Blog yazısı',
  CUSTOM_URL: 'Özel URL',
};
