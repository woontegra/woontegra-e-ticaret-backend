import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PageStatus, Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { passivateDemoProducts } from '../db/seed-data.js';
import {
  buildCanonicalUrl,
  countWords,
  isWeakHtml,
  mapLegacyDeliveryMode,
  normalizeDownloadFiles,
} from './legacy-import/mappers.js';
import {
  ensureMediaAssetFromUrl,
  trackLocalImagePath,
} from './legacy-import/media.js';
import {
  createEmptyReport,
  printReportSummary,
  resolveReportOutputPath,
  writeReportFile,
} from './legacy-import/report.js';
import type {
  LegacyBlogPost,
  LegacyPage,
  LegacyProduct,
  LegacySnapshot,
} from './legacy-import/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

function resolveSnapshotPath(): string {
  const custom = process.env.LEGACY_EXPORT_PATH?.trim();
  if (custom) return path.resolve(custom);
  return path.join(
    REPO_ROOT,
    'legacy-reference/old-website/export/legacy-snapshot.json',
  );
}

function loadSnapshot(filePath: string): LegacySnapshot {
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as LegacySnapshot;
}

function toDecimal(value: number | null | undefined): Prisma.Decimal | null {
  if (value === null || value === undefined) return null;
  return new Prisma.Decimal(value);
}

function mapPageStatus(status?: string): PageStatus {
  return status?.toLowerCase() === 'published'
    ? PageStatus.PUBLISHED
    : PageStatus.DRAFT;
}

async function upsertProductCategories(
  snapshot: LegacySnapshot,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const category of snapshot.categories ?? []) {
    const record = await prisma.productCategory.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
        sortOrder: category.sortOrder ?? 0,
        isActive: true,
      },
      update: {
        name: category.name,
        description: category.description ?? null,
        sortOrder: category.sortOrder ?? 0,
        isActive: true,
      },
    });
    map.set(category.slug, record.id);
  }
  return map;
}

async function upsertBlogCategories(
  snapshot: LegacySnapshot,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const category of snapshot.blogCategories ?? []) {
    const record = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
        isActive: true,
      },
      update: {
        name: category.name,
        description: category.description ?? null,
        isActive: true,
      },
    });
    map.set(category.slug, record.id);
  }
  return map;
}

async function resolveProductImage(
  product: LegacyProduct,
  report: ReturnType<typeof createEmptyReport>,
): Promise<{ mainImageId: string | null; galleryImageIds: string[] }> {
  let mainImageId: string | null = null;
  const galleryImageIds: string[] = [];

  if (product.coverImageUrl) {
    mainImageId = await ensureMediaAssetFromUrl(product.coverImageUrl, {
      usageType: 'PRODUCT_IMAGE',
      folder: 'products',
      altText: product.name,
      report,
    });
  } else if (product.coverImageLocalPath) {
    trackLocalImagePath(
      product.coverImageLocalPath,
      `product:${product.slug}`,
      report,
    );
  }

  for (const url of product.galleryImageUrls ?? []) {
    const id = await ensureMediaAssetFromUrl(url, {
      usageType: 'PRODUCT_IMAGE',
      folder: 'products',
      altText: product.name,
      report,
    });
    if (id) galleryImageIds.push(id);
  }

  return { mainImageId, galleryImageIds };
}

function assessProductQuality(
  product: LegacyProduct,
  deliveryMode: string,
  report: ReturnType<typeof createEmptyReport>,
  hasMainImage: boolean,
): void {
  if (isWeakHtml(product.descriptionHtml) && !product.shortDescription?.trim()) {
    report.products.weakDescription.push(product.slug);
  }
  if (!hasMainImage) {
    report.products.missingImage.push(product.slug);
  }
  if (
    deliveryMode === 'LICENSED_DOWNLOAD' &&
    !product.licenseAppCode?.trim()
  ) {
    report.products.missingLicenseAppCode.push(product.slug);
  }
  if (
    ['FREE_DOWNLOAD', 'PAID_DOWNLOAD', 'LICENSED_DOWNLOAD'].includes(
      deliveryMode,
    ) &&
    !product.downloadFiles?.files?.length
  ) {
    report.products.missingDownloadFiles.push(product.slug);
  }
  if (!product.seoTitle?.trim() || !product.seoDescription?.trim()) {
    report.products.missingSeo.push(product.slug);
  }
  for (const file of product.downloadFiles?.files ?? []) {
    if (file.needsR2Mapping) {
      report.products.r2MappingNeeded.push(
        `${product.slug}: ${file.label} (${file.legacyPublicUrlPattern ?? 'unknown'})`,
      );
    }
  }
}

async function importProducts(
  snapshot: LegacySnapshot,
  categoryMap: Map<string, string>,
  report: ReturnType<typeof createEmptyReport>,
): Promise<void> {
  for (const product of snapshot.products ?? []) {
    if (product.redirectToSlug) {
      report.preservedSlugs.products.push(product.slug);
    }

    const mapped = mapLegacyDeliveryMode(product);
    const categoryId = product.categorySlug
      ? (categoryMap.get(product.categorySlug) ?? null)
      : null;
    const { mainImageId, galleryImageIds } = await resolveProductImage(
      product,
      report,
    );

    const downloadFiles = normalizeDownloadFiles(product.downloadFiles);
    const status = product.redirectToSlug
      ? ProductStatus.PASSIVE
      : ProductStatus.ACTIVE;

    const data = {
      name: product.name,
      slug: product.slug,
      productKind: mapped.productKind,
      deliveryMode: mapped.deliveryMode,
      purchaseEnabled: mapped.purchaseEnabled,
      licenseRequired: mapped.licenseRequired,
      licenseAppCode:
        mapped.deliveryMode === 'LICENSED_DOWNLOAD'
          ? (product.licenseAppCode ?? null)
          : null,
      licenseDays: product.licenseDays ?? null,
      licenseMonths: product.licenseMonths ?? null,
      licenseMaxDevices: product.licenseMaxDevices ?? null,
      saasAppCode: mapped.saasAppCode,
      saasPlanCode: mapped.saasPlanCode,
      saasTrialDays: product.saasTrialDays ?? null,
      saasRequiresLogin: mapped.saasRequiresLogin,
      downloadFiles,
      shortDescription: product.shortDescription ?? null,
      descriptionHtml: product.descriptionHtml ?? '',
      categoryId,
      status,
      basePrice: toDecimal(product.price),
      salePrice: toDecimal(product.price),
      compareAtPrice: toDecimal(product.compareAtPrice),
      currency: product.currency ?? 'TRY',
      version: product.version ?? null,
      featureBullets: product.featureBullets ?? [],
      sortOrder: product.sortOrder ?? 0,
      isFeatured: product.isFeatured ?? false,
      mainImageId,
      galleryImageIds,
      seoTitle: product.seoTitle ?? null,
      seoDescription: product.seoDescription ?? null,
      canonicalUrl: buildCanonicalUrl(product.slug),
      robotsIndex: true,
    };

    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (existing) {
      await prisma.product.update({ where: { slug: product.slug }, data });
      report.products.updated.push(product.slug);
    } else {
      await prisma.product.create({ data });
      report.products.imported.push(product.slug);
    }

    if (!product.redirectToSlug) {
      report.preservedSlugs.products.push(product.slug);
    }

    assessProductQuality(
      product,
      mapped.deliveryMode,
      report,
      Boolean(mainImageId),
    );
  }
}

async function resolveBlogCover(
  post: LegacyBlogPost,
  report: ReturnType<typeof createEmptyReport>,
): Promise<string | null> {
  if (post.coverImageUrl) {
    return ensureMediaAssetFromUrl(post.coverImageUrl, {
      usageType: 'BLOG_IMAGE',
      folder: 'blog',
      altText: post.title,
      report,
    });
  }
  if (post.coverImageLocalPath) {
    trackLocalImagePath(
      post.coverImageLocalPath,
      `blog:${post.slug}`,
      report,
    );
  }
  return null;
}

function assessBlogQuality(
  post: LegacyBlogPost,
  coverImageId: string | null,
  report: ReturnType<typeof createEmptyReport>,
): void {
  const words = countWords(post.contentHtml ?? '');
  if (words < 500) {
    report.blog.under500Words.push(`${post.slug} (${words} words)`);
  }
  if (!coverImageId) {
    report.blog.missingCover.push(post.slug);
  }
  if (!post.seoDescription?.trim()) {
    report.blog.missingSeoDescription.push(post.slug);
  }
  const weakTitle = (post.title?.trim().length ?? 0) < 10;
  if (
    words < 500 ||
    isWeakHtml(post.contentHtml, 40) ||
    weakTitle ||
    !post.excerpt?.trim()
  ) {
    report.blog.weakContent.push(post.slug);
  }
}

async function importBlogPosts(
  snapshot: LegacySnapshot,
  categoryMap: Map<string, string>,
  report: ReturnType<typeof createEmptyReport>,
): Promise<void> {
  for (const post of snapshot.blogPosts ?? []) {
    const coverImageId = await resolveBlogCover(post, report);
    const categoryId = post.categorySlug
      ? (categoryMap.get(post.categorySlug) ?? null)
      : null;
    const status = mapPageStatus(post.status);
    const publishedAt = post.publishedAt
      ? new Date(post.publishedAt)
      : null;

    const data = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? null,
      contentHtml: post.contentHtml ?? '',
      coverImageId,
      categoryId,
      status,
      authorName: post.authorName ?? 'Woontegra',
      tags: post.tags ?? [],
      seoTitle: post.seoTitle ?? post.title,
      seoDescription: post.seoDescription ?? post.excerpt ?? null,
      robotsIndex: status === PageStatus.PUBLISHED,
      publishedAt: status === PageStatus.PUBLISHED ? publishedAt : null,
    };

    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (existing) {
      await prisma.blogPost.update({ where: { slug: post.slug }, data });
      report.blog.updated.push(post.slug);
    } else {
      await prisma.blogPost.create({ data });
      report.blog.imported.push(post.slug);
    }

    report.preservedSlugs.blog.push(post.slug);
    assessBlogQuality(post, coverImageId, report);
  }
}

function assessPageQuality(
  page: LegacyPage,
  report: ReturnType<typeof createEmptyReport>,
): void {
  if (!page.seoTitle?.trim() || !page.seoDescription?.trim()) {
    report.pages.missingSeo.push(page.slug);
  }
  if (isWeakHtml(page.contentHtml, 30)) {
    report.pages.missingContent.push(page.slug);
  }
}

async function importPages(
  snapshot: LegacySnapshot,
  report: ReturnType<typeof createEmptyReport>,
): Promise<void> {
  for (const page of snapshot.pages ?? []) {
    const status = mapPageStatus(page.status);
    const pageType =
      page.pageType === 'LEGAL'
        ? 'LEGAL'
        : page.pageType === 'LANDING'
          ? 'LANDING'
          : 'STANDARD';

    const data = {
      title: page.title,
      slug: page.slug,
      pageType: pageType as 'STANDARD' | 'LEGAL' | 'LANDING',
      status,
      contentHtml: page.contentHtml ?? '',
      seoTitle: page.seoTitle ?? page.title,
      seoDescription: page.seoDescription ?? null,
      robotsIndex: page.robotsIndex ?? status === PageStatus.PUBLISHED,
      publishedAt: status === PageStatus.PUBLISHED ? new Date() : null,
      canonicalUrl:
        page.slug === 'iletisim' ? '/iletisim' : `/sayfa/${page.slug}`,
    };

    const existing = await prisma.page.findUnique({
      where: { slug: page.slug },
    });

    if (existing) {
      await prisma.page.update({ where: { slug: page.slug }, data });
      report.pages.updated.push(page.slug);
    } else {
      await prisma.page.create({ data });
      report.pages.imported.push(page.slug);
    }

    report.preservedSlugs.pages.push(page.slug);
    assessPageQuality(page, report);
  }
}

async function importRedirects(
  snapshot: LegacySnapshot,
  report: ReturnType<typeof createEmptyReport>,
): Promise<void> {
  for (const rule of snapshot.redirects ?? []) {
    const existing = await prisma.redirectRule.findUnique({
      where: { sourcePath: rule.sourcePath },
    });

    const data = {
      sourcePath: rule.sourcePath,
      targetPath: rule.targetPath,
      statusCode: rule.statusCode ?? 301,
      isActive: true,
    };

    if (existing) {
      await prisma.redirectRule.update({
        where: { sourcePath: rule.sourcePath },
        data,
      });
      report.redirects.updated.push(rule.sourcePath);
    } else {
      await prisma.redirectRule.create({ data });
      report.redirects.imported.push(rule.sourcePath);
    }
  }
}

async function main(): Promise<void> {
  const snapshotPath = resolveSnapshotPath();
  console.log(`[legacy-import] Loading snapshot: ${snapshotPath}`);

  const snapshot = loadSnapshot(snapshotPath);
  const report = createEmptyReport(snapshotPath);

  const productCategoryMap = await upsertProductCategories(snapshot);
  const blogCategoryMap = await upsertBlogCategories(snapshot);

  await importProducts(snapshot, productCategoryMap, report);
  await importBlogPosts(snapshot, blogCategoryMap, report);
  await importPages(snapshot, report);
  await importRedirects(snapshot, report);

  await passivateDemoProducts(prisma);

  const reportPath = resolveReportOutputPath();
  writeReportFile(report, reportPath);
  printReportSummary(report);
  console.log(`\nReport written to: ${reportPath}`);
}

main()
  .catch((error) => {
    console.error('[legacy-import] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
