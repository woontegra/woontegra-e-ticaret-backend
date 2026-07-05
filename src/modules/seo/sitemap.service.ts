import { PageStatus, ProductStatus } from '@prisma/client';
import { resolvePublicSiteUrl } from '../../lib/public-url.js';
import { prisma } from '../../lib/prisma.js';
import { getSeoSettingRecord } from './seo-setting.service.js';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function resolveBaseUrl(): Promise<string> {
  const [seo, site] = await Promise.all([
    getSeoSettingRecord(),
    prisma.siteSetting.findUnique({ where: { id: 'default' } }),
  ]);

  return resolvePublicSiteUrl(seo.canonicalBaseUrl, site?.domain);
}

export async function generateRobotsTxt(): Promise<string> {
  const [seo, baseUrl] = await Promise.all([
    getSeoSettingRecord(),
    resolveBaseUrl(),
  ]);

  if (seo.robotsTxt.trim()) {
    const content = seo.robotsTxt.trim();
    if (content.toLowerCase().includes('sitemap:') || !baseUrl) {
      return content;
    }
    return `${content}\n\nSitemap: ${baseUrl}/sitemap.xml`;
  }

  const lines = ['User-agent: *', 'Allow: /'];
  if (baseUrl) {
    lines.push('', `Sitemap: ${baseUrl}/sitemap.xml`);
  }
  return lines.join('\n');
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
}

function urlEntry(url: SitemapUrl): string {
  const lastmod = url.lastmod
    ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>`
    : '';
  return `<url><loc>${escapeXml(url.loc)}</loc>${lastmod}</url>`;
}

export async function generateSitemapXml(): Promise<string> {
  const [seo, baseUrl] = await Promise.all([
    getSeoSettingRecord(),
    resolveBaseUrl(),
  ]);

  if (!baseUrl) {
    return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }

  const urls: SitemapUrl[] = [
    { loc: `${baseUrl}/` },
    { loc: `${baseUrl}/urunler` },
    { loc: `${baseUrl}/yazilimlar` },
    { loc: `${baseUrl}/blog` },
    { loc: `${baseUrl}/iletisim` },
  ];

  const tasks: Promise<void>[] = [];

  if (seo.sitemapIncludeProducts) {
    tasks.push(
      prisma.product
        .findMany({
          where: { status: ProductStatus.ACTIVE },
          select: {
            slug: true,
            productKind: true,
            updatedAt: true,
          },
        })
        .then((products) => {
          for (const product of products) {
            const prefix =
              product.productKind === 'SOFTWARE' ? '/yazilimlar' : '/urun';
            urls.push({
              loc: `${baseUrl}${prefix}/${product.slug}`,
              lastmod: product.updatedAt.toISOString(),
            });
          }
        }),
    );
  }

  if (seo.sitemapIncludeCategories) {
    tasks.push(
      prisma.productCategory
        .findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        })
        .then((categories) => {
          for (const category of categories) {
            urls.push({
              loc: `${baseUrl}/kategori/${category.slug}`,
              lastmod: category.updatedAt.toISOString(),
            });
          }
        }),
    );
  }

  if (seo.sitemapIncludePages) {
    tasks.push(
      prisma.page
        .findMany({
          where: { status: PageStatus.PUBLISHED },
          select: { slug: true, updatedAt: true },
        })
        .then((pages) => {
          for (const page of pages) {
            urls.push({
              loc: `${baseUrl}/sayfa/${page.slug}`,
              lastmod: page.updatedAt.toISOString(),
            });
          }
        }),
    );
  }

  if (seo.sitemapIncludeBlogPosts) {
    tasks.push(
      prisma.blogPost
        .findMany({
          where: { status: PageStatus.PUBLISHED },
          select: { slug: true, updatedAt: true },
        })
        .then((posts) => {
          for (const post of posts) {
            urls.push({
              loc: `${baseUrl}/blog/${post.slug}`,
              lastmod: post.updatedAt.toISOString(),
            });
          }
        }),
    );
  }

  await Promise.all(tasks);

  const body = urls.map(urlEntry).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}
