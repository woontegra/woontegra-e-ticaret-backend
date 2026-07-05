import { AppError } from '../../lib/app-error.js';
import {
  toFilterableAttributeDto,
  toProductAttributeAssignmentDto,
  toProductAttributeDto,
  toProductAttributeValueDto,
} from '../../lib/product-attribute.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { slugify } from '../../lib/slug.js';
import type {
  CreateProductAttributeInput,
  CreateProductAttributeValueInput,
  UpdateProductAttributeInput,
  UpdateProductAttributeValueInput,
} from './product-attribute.schema.js';
import type { SaveProductAttributeAssignmentsInput } from './product-variant.schema.js';

async function resolveUniqueAttributeCode(
  name: string,
  code?: string,
  excludeId?: string,
) {
  const base = slugify(code ?? name).replace(/-/g, '_') || 'attribute';
  let candidate = base;
  let suffix = 0;

  while (true) {
    const existing = await prisma.productAttribute.findFirst({
      where: {
        code: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}_${suffix}`;
  }
}

const attributeInclude = {
  values: { orderBy: [{ sortOrder: 'asc' as const }, { value: 'asc' as const }] },
};

const assignmentInclude = {
  attribute: true,
  attributeValue: true,
} as const;

async function ensureProductExists(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

export async function listProductAttributes() {
  const attributes = await prisma.productAttribute.findMany({
    include: attributeInclude,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return attributes.map(toProductAttributeDto);
}

export async function getProductAttributeById(id: string) {
  const attribute = await prisma.productAttribute.findUnique({
    where: { id },
    include: attributeInclude,
  });

  if (!attribute) throw AppError.notFound('Attribute not found');
  return toProductAttributeDto(attribute);
}

export async function createProductAttribute(input: CreateProductAttributeInput) {
  const code = await resolveUniqueAttributeCode(input.name, input.code);

  const attribute = await prisma.productAttribute.create({
    data: {
      name: input.name,
      code,
      type: input.type,
      isFilterable: input.isFilterable ?? false,
      isVariantOption: input.isVariantOption ?? false,
      sortOrder: input.sortOrder ?? 0,
    },
    include: attributeInclude,
  });

  return toProductAttributeDto(attribute);
}

export async function updateProductAttribute(
  id: string,
  input: UpdateProductAttributeInput,
) {
  const existing = await prisma.productAttribute.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Attribute not found');

  const code =
    input.code !== undefined || input.name !== undefined
      ? await resolveUniqueAttributeCode(
          input.name ?? existing.name,
          input.code ?? existing.code,
          id,
        )
      : undefined;

  const attribute = await prisma.productAttribute.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(code !== undefined ? { code } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.isFilterable !== undefined
        ? { isFilterable: input.isFilterable }
        : {}),
      ...(input.isVariantOption !== undefined
        ? { isVariantOption: input.isVariantOption }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
    include: attributeInclude,
  });

  return toProductAttributeDto(attribute);
}

export async function deleteProductAttribute(id: string) {
  const existing = await prisma.productAttribute.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Attribute not found');
  await prisma.productAttribute.delete({ where: { id } });
}

export async function createProductAttributeValue(
  attributeId: string,
  input: CreateProductAttributeValueInput,
) {
  const attribute = await prisma.productAttribute.findUnique({
    where: { id: attributeId },
  });
  if (!attribute) throw AppError.notFound('Attribute not found');

  const value = await prisma.productAttributeValue.create({
    data: {
      attributeId,
      value: input.value,
      colorHex: input.colorHex ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  return toProductAttributeValueDto(value);
}

export async function updateProductAttributeValue(
  attributeId: string,
  valueId: string,
  input: UpdateProductAttributeValueInput,
) {
  const existing = await prisma.productAttributeValue.findFirst({
    where: { id: valueId, attributeId },
  });
  if (!existing) throw AppError.notFound('Attribute value not found');

  const value = await prisma.productAttributeValue.update({
    where: { id: valueId },
    data: {
      ...(input.value !== undefined ? { value: input.value } : {}),
      ...(input.colorHex !== undefined ? { colorHex: input.colorHex } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });

  return toProductAttributeValueDto(value);
}

export async function deleteProductAttributeValue(
  attributeId: string,
  valueId: string,
) {
  const existing = await prisma.productAttributeValue.findFirst({
    where: { id: valueId, attributeId },
  });
  if (!existing) throw AppError.notFound('Attribute value not found');
  await prisma.productAttributeValue.delete({ where: { id: valueId } });
}

export async function listProductAttributeAssignments(productId: string) {
  await ensureProductExists(productId);

  const assignments = await prisma.productAttributeAssignment.findMany({
    where: { productId },
    include: assignmentInclude,
    orderBy: { attribute: { sortOrder: 'asc' } },
  });

  return assignments.map(toProductAttributeAssignmentDto);
}

export async function saveProductAttributeAssignments(
  productId: string,
  input: SaveProductAttributeAssignmentsInput,
) {
  await ensureProductExists(productId);

  for (const item of input.assignments) {
    const attribute = await prisma.productAttribute.findUnique({
      where: { id: item.attributeId },
    });
    if (!attribute) {
      throw AppError.badRequest(`Invalid attribute: ${item.attributeId}`);
    }
    if (attribute.isVariantOption) {
      throw AppError.badRequest(
        `Variant option attributes cannot be assigned directly: ${attribute.name}`,
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.productAttributeAssignment.deleteMany({ where: { productId } });

    if (input.assignments.length > 0) {
      await tx.productAttributeAssignment.createMany({
        data: input.assignments.map((item) => ({
          productId,
          attributeId: item.attributeId,
          valueText: item.valueText ?? null,
          valueNumber: item.valueNumber ?? null,
          valueBoolean: item.valueBoolean ?? null,
          attributeValueId: item.attributeValueId ?? null,
        })),
      });
    }
  });

  return listProductAttributeAssignments(productId);
}

export async function listFilterableAttributes() {
  const attributes = await prisma.productAttribute.findMany({
    where: { isFilterable: true },
    include: attributeInclude,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return attributes.map(toFilterableAttributeDto);
}

export async function loadPublicProductAttributes(productId: string) {
  const assignments = await prisma.productAttributeAssignment.findMany({
    where: {
      productId,
      attribute: { isVariantOption: false },
    },
    include: assignmentInclude,
    orderBy: { attribute: { sortOrder: 'asc' } },
  });

  return assignments;
}
