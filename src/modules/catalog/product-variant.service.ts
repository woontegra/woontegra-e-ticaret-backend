import { AppError } from '../../lib/app-error.js';
import {
  toProductVariantDto,
  toProductVariantDtos,
  variantOptionKey,
} from '../../lib/product-attribute.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateProductVariantInput,
  GenerateProductVariantsInput,
  UpdateProductVariantInput,
} from './product-variant.schema.js';
import {
  notifyLowStock,
  shouldNotifyLowStock,
} from '../notifications/notification.service.js';

const variantInclude = {
  options: {
    include: {
      attribute: true,
      attributeValue: true,
    },
  },
} as const;

async function ensureProductExists(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

async function validateVariantOptions(
  options: Array<{ attributeId: string; attributeValueId: string }>,
) {
  for (const option of options) {
    const attribute = await prisma.productAttribute.findUnique({
      where: { id: option.attributeId },
    });

    if (!attribute?.isVariantOption) {
      throw AppError.badRequest('Invalid variant attribute');
    }

    const value = await prisma.productAttributeValue.findFirst({
      where: {
        id: option.attributeValueId,
        attributeId: option.attributeId,
      },
    });

    if (!value) {
      throw AppError.badRequest('Invalid attribute value for variant option');
    }
  }
}

function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((prefix) => curr.map((item) => [...prefix, item])),
    [[]],
  );
}

export async function listProductVariants(productId: string) {
  await ensureProductExists(productId);

  const variants = await prisma.productVariant.findMany({
    where: { productId },
    include: variantInclude,
    orderBy: { createdAt: 'asc' },
  });

  return toProductVariantDtos(variants);
}

export async function createProductVariant(
  productId: string,
  input: CreateProductVariantInput,
) {
  await ensureProductExists(productId);
  await validateVariantOptions(input.options);

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku: input.sku ?? null,
      barcode: input.barcode ?? null,
      price: input.price ?? null,
      salePrice: input.salePrice ?? null,
      stockQuantity: input.stockQuantity ?? null,
      imageId: input.imageId ?? null,
      isActive: input.isActive ?? true,
      options: {
        create: input.options.map((option) => ({
          attributeId: option.attributeId,
          attributeValueId: option.attributeValueId,
        })),
      },
    },
    include: variantInclude,
  });

  return toProductVariantDto(variant);
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  input: UpdateProductVariantInput,
) {
  const existing = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    include: variantInclude,
  });

  if (!existing) throw AppError.notFound('Variant not found');

  if (input.options) {
    await validateVariantOptions(input.options);
  }

  await prisma.$transaction(async (tx) => {
    if (input.options) {
      await tx.productVariantOption.deleteMany({ where: { variantId } });
    }

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.salePrice !== undefined ? { salePrice: input.salePrice } : {}),
        ...(input.stockQuantity !== undefined
          ? { stockQuantity: input.stockQuantity }
          : {}),
        ...(input.imageId !== undefined ? { imageId: input.imageId } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.options
          ? {
              options: {
                create: input.options.map((option) => ({
                  attributeId: option.attributeId,
                  attributeValueId: option.attributeValueId,
                })),
              },
            }
          : {}),
      },
    });
  });

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: variantInclude,
  });

  if (input.stockQuantity !== undefined) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (
      product &&
      shouldNotifyLowStock(
        product.stockTrackingEnabled,
        input.stockQuantity,
        product.lowStockThreshold,
      )
    ) {
      notifyLowStock({
        id: product.id,
        name: product.name,
        stockQuantity: input.stockQuantity,
      });
    }
  }

  return toProductVariantDto(variant!);
}

export async function deleteProductVariant(productId: string, variantId: string) {
  const existing = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!existing) throw AppError.notFound('Variant not found');
  await prisma.productVariant.delete({ where: { id: variantId } });
}

export async function generateProductVariants(
  productId: string,
  input: GenerateProductVariantsInput,
) {
  await ensureProductExists(productId);

  const attributeIds = input.selections.map((item) => item.attributeId);
  const attributes = await prisma.productAttribute.findMany({
    where: { id: { in: attributeIds }, isVariantOption: true },
    include: { values: true },
  });

  if (attributes.length !== attributeIds.length) {
    throw AppError.badRequest('One or more invalid variant attributes');
  }

  for (const selection of input.selections) {
    const attribute = attributes.find((item) => item.id === selection.attributeId);
    const validIds = new Set(attribute?.values.map((value) => value.id));
    if (selection.valueIds.some((id) => !validIds.has(id))) {
      throw AppError.badRequest('Invalid value ids for attribute selection');
    }
  }

  const combos = cartesian(
    input.selections.map((selection) =>
      selection.valueIds.map((valueId) => ({
        attributeId: selection.attributeId,
        attributeValueId: valueId,
      })),
    ),
  );

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId },
    include: variantInclude,
  });

  const existingKeys = new Set(
    existingVariants.map((variant) =>
      variantOptionKey(
        variant.options.map((option) => ({
          attributeId: option.attributeId,
          attributeValueId: option.attributeValueId,
        })),
      ),
    ),
  );

  const created = [];

  for (const combo of combos) {
    const key = variantOptionKey(combo);
    if (existingKeys.has(key)) continue;

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        isActive: true,
        options: {
          create: combo.map((option) => ({
            attributeId: option.attributeId,
            attributeValueId: option.attributeValueId,
          })),
        },
      },
      include: variantInclude,
    });

    existingKeys.add(key);
    created.push(variant);
  }

  const allVariants = await prisma.productVariant.findMany({
    where: { productId },
    include: variantInclude,
    orderBy: { createdAt: 'asc' },
  });

  return {
    created: await toProductVariantDtos(created),
    variants: await toProductVariantDtos(allVariants),
  };
}

export async function loadPublicProductVariants(productId: string) {
  return prisma.productVariant.findMany({
    where: { productId, isActive: true },
    include: variantInclude,
    orderBy: { createdAt: 'asc' },
  });
}
