import { AppError } from '../../lib/app-error.js';
import { toBrandDtoWithUrls } from '../../lib/product.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { slugify } from '../../lib/slug.js';
import type { CreateBrandInput, ListBrandsQuery, UpdateBrandInput } from './brand.schema.js';
import { resolvePagination } from '../../lib/pagination.js';

async function resolveUniqueBrandSlug(
  name: string,
  slug?: string,
  excludeId?: string,
) {
  const base = slugify(slug ?? name);
  let candidate = base || 'marka';
  let suffix = 0;

  while (true) {
    const existing = await prisma.brand.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function listBrands(query: ListBrandsQuery = {}) {
  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { slug: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const { skip, limit } = resolvePagination(query);

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.brand.count({ where }),
  ]);

  return {
    items: await Promise.all(brands.map(toBrandDtoWithUrls)),
    total,
  };
}

export async function getBrandById(id: string) {
  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    throw AppError.notFound('Brand not found');
  }

  return toBrandDtoWithUrls(brand);
}

export async function createBrand(input: CreateBrandInput) {
  const slug = await resolveUniqueBrandSlug(input.name, input.slug);

  const brand = await prisma.brand.create({
    data: {
      name: input.name,
      slug,
      logoId: input.logoId ?? null,
      description: input.description ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      isActive: input.isActive ?? true,
    },
  });

  return toBrandDtoWithUrls(brand);
}

export async function updateBrand(id: string, input: UpdateBrandInput) {
  const existing = await prisma.brand.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Brand not found');
  }

  const slug =
    input.slug !== undefined || input.name !== undefined
      ? await resolveUniqueBrandSlug(
          input.name ?? existing.name,
          input.slug ?? existing.slug,
          id,
        )
      : undefined;

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(input.logoId !== undefined ? { logoId: input.logoId } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined
        ? { seoDescription: input.seoDescription }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toBrandDtoWithUrls(brand);
}

export async function deleteBrand(id: string) {
  const existing = await prisma.brand.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Brand not found');
  }

  await prisma.brand.delete({ where: { id } });
}

export async function listPublicBrands() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const counts = await Promise.all(
    brands.map((brand) =>
      prisma.product.count({
        where: { brandId: brand.id, status: 'ACTIVE' },
      }),
    ),
  );

  const dtos = await Promise.all(brands.map(toBrandDtoWithUrls));

  return dtos.map((brand, index) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    description: brand.description,
    productCount: counts[index],
  }));
}

export async function getPublicBrandBySlug(slug: string) {
  const brand = await prisma.brand.findFirst({
    where: { slug, isActive: true },
  });

  if (!brand) {
    throw AppError.notFound('Brand not found');
  }

  const dto = await toBrandDtoWithUrls(brand);
  const productCount = await prisma.product.count({
    where: { brandId: brand.id, status: 'ACTIVE' },
  });

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logoUrl: dto.logoUrl,
    description: dto.description,
    seoTitle: brand.seoTitle,
    seoDescription: brand.seoDescription,
    productCount,
  };
}
