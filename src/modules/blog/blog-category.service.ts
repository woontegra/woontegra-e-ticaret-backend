import { AppError } from '../../lib/app-error.js';
import { toBlogCategoryDto } from '../../lib/blog.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { slugify } from '../../lib/slug.js';
import type {
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
} from './blog-category.schema.js';

async function resolveUniqueCategorySlug(
  name: string,
  slug?: string,
  excludeId?: string,
) {
  const base = slugify(slug ?? name);
  let candidate = base || 'kategori';
  let suffix = 0;

  while (true) {
    const existing = await prisma.blogCategory.findFirst({
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

export async function listBlogCategories() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
  });

  return categories.map(toBlogCategoryDto);
}

export async function getBlogCategoryById(id: string) {
  const category = await prisma.blogCategory.findUnique({ where: { id } });

  if (!category) {
    throw AppError.notFound('Blog category not found');
  }

  return toBlogCategoryDto(category);
}

export async function createBlogCategory(input: CreateBlogCategoryInput) {
  const slug = await resolveUniqueCategorySlug(input.name, input.slug);

  try {
    const category = await prisma.blogCategory.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        isActive: input.isActive ?? true,
      },
    });

    return toBlogCategoryDto(category);
  } catch {
    throw AppError.conflict('Category slug already exists');
  }
}

export async function updateBlogCategory(
  id: string,
  input: UpdateBlogCategoryInput,
) {
  const existing = await prisma.blogCategory.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Blog category not found');
  }

  const slug =
    input.slug !== undefined
      ? await resolveUniqueCategorySlug(
          input.name ?? existing.name,
          input.slug,
          id,
        )
      : undefined;

  try {
    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(slug !== undefined ? { slug } : {}),
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

    return toBlogCategoryDto(category);
  } catch {
    throw AppError.conflict('Category slug already exists');
  }
}

export async function deleteBlogCategory(id: string) {
  const existing = await prisma.blogCategory.findUnique({ where: { id } });

  if (!existing) {
    throw AppError.notFound('Blog category not found');
  }

  await prisma.blogCategory.delete({ where: { id } });
}
