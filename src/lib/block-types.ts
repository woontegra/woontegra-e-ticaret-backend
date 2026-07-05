import type { PageBlockType as PrismaPageBlockType } from '@prisma/client';
import type { PageBlockType } from '../types/api.js';

export const PAGE_BLOCK_TYPES: PageBlockType[] = [
  'HERO',
  'HERO_SLIDER',
  'TEXT',
  'TEXT_IMAGE',
  'IMAGE_BANNER',
  'PRODUCT_GRID',
  'PRODUCT_CAROUSEL',
  'CATEGORY_GRID',
  'BLOG_GRID',
  'TRUST_BADGES',
  'FAQ',
  'CONTACT_FORM',
  'BRAND_LOGOS',
  'TESTIMONIALS',
  'NEWSLETTER',
  'CUSTOM_SPACER',
];

export const PAGE_BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  HERO: 'Hero',
  HERO_SLIDER: 'Hero Slider',
  TEXT: 'Metin',
  TEXT_IMAGE: 'Metin + Görsel',
  IMAGE_BANNER: 'Görsel Banner',
  PRODUCT_GRID: 'Ürün Grid',
  PRODUCT_CAROUSEL: 'Ürün Carousel',
  CATEGORY_GRID: 'Kategori Grid',
  BLOG_GRID: 'Blog Grid',
  TRUST_BADGES: 'Güven Rozetleri',
  FAQ: 'SSS',
  CONTACT_FORM: 'İletişim Formu',
  BRAND_LOGOS: 'Marka Logoları',
  TESTIMONIALS: 'Referanslar',
  NEWSLETTER: 'Bülten',
  CUSTOM_SPACER: 'Boşluk',
};

export function isValidBlockType(type: string): type is PageBlockType {
  return PAGE_BLOCK_TYPES.includes(type as PageBlockType);
}

export function toPrismaBlockType(type: PageBlockType): PrismaPageBlockType {
  return type as PrismaPageBlockType;
}
