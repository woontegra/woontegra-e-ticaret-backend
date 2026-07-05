import type {
  ProductAttribute,
  ProductAttributeAssignment,
  ProductAttributeValue,
  ProductVariant,
  ProductVariantOption,
  Prisma,
} from '@prisma/client';
import type {
  FilterableAttributeDto,
  ProductAttributeAssignmentDto,
  ProductAttributeDto,
  ProductAttributeValueDto,
  ProductVariantDto,
  ProductVariantOptionDto,
  PublicProductAttributeRowDto,
  PublicVariantAttributeDto,
  PublicProductVariantDto,
} from '../types/api.js';
import { resolveMediaUrlMap } from './media-url.js';

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function toProductAttributeValueDto(
  value: ProductAttributeValue,
): ProductAttributeValueDto {
  return {
    id: value.id,
    attributeId: value.attributeId,
    value: value.value,
    colorHex: value.colorHex,
    sortOrder: value.sortOrder,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
}

export function toProductAttributeDto(
  attribute: ProductAttribute & { values?: ProductAttributeValue[] },
): ProductAttributeDto {
  return {
    id: attribute.id,
    name: attribute.name,
    code: attribute.code,
    type: attribute.type,
    isFilterable: attribute.isFilterable,
    isVariantOption: attribute.isVariantOption,
    sortOrder: attribute.sortOrder,
    values: attribute.values?.map(toProductAttributeValueDto) ?? [],
    createdAt: attribute.createdAt.toISOString(),
    updatedAt: attribute.updatedAt.toISOString(),
  };
}

type AssignmentWithRelations = ProductAttributeAssignment & {
  attribute: ProductAttribute;
  attributeValue?: ProductAttributeValue | null;
};

export function toProductAttributeAssignmentDto(
  assignment: AssignmentWithRelations,
): ProductAttributeAssignmentDto {
  return {
    id: assignment.id,
    productId: assignment.productId,
    attributeId: assignment.attributeId,
    attribute: {
      id: assignment.attribute.id,
      name: assignment.attribute.name,
      code: assignment.attribute.code,
      type: assignment.attribute.type,
      isFilterable: assignment.attribute.isFilterable,
      isVariantOption: assignment.attribute.isVariantOption,
    },
    valueText: assignment.valueText,
    valueNumber: decimalToNumber(assignment.valueNumber),
    valueBoolean: assignment.valueBoolean,
    attributeValueId: assignment.attributeValueId,
    attributeValue: assignment.attributeValue
      ? toProductAttributeValueDto(assignment.attributeValue)
      : null,
  };
}

function getAssignmentDisplayValue(
  assignment: AssignmentWithRelations,
): string {
  if (assignment.attributeValue) return assignment.attributeValue.value;
  if (assignment.valueText) return assignment.valueText;
  if (assignment.valueNumber !== null && assignment.valueNumber !== undefined) {
    return String(decimalToNumber(assignment.valueNumber));
  }
  if (assignment.valueBoolean !== null && assignment.valueBoolean !== undefined) {
    return assignment.valueBoolean ? 'Evet' : 'Hayır';
  }
  return '—';
}

export function toPublicProductAttributeRowDto(
  assignment: AssignmentWithRelations,
): PublicProductAttributeRowDto {
  return {
    name: assignment.attribute.name,
    code: assignment.attribute.code,
    type: assignment.attribute.type,
    value: getAssignmentDisplayValue(assignment),
    isFilterable: assignment.attribute.isFilterable,
    colorHex: assignment.attributeValue?.colorHex ?? null,
  };
}

type VariantWithRelations = ProductVariant & {
  options: Array<
    ProductVariantOption & {
      attribute: ProductAttribute;
      attributeValue: ProductAttributeValue;
    }
  >;
};

export function toProductVariantOptionDto(
  option: ProductVariantOption & {
    attribute: ProductAttribute;
    attributeValue: ProductAttributeValue;
  },
): ProductVariantOptionDto {
  return {
    id: option.id,
    variantId: option.variantId,
    attributeId: option.attributeId,
    attributeValueId: option.attributeValueId,
    attribute: {
      id: option.attribute.id,
      name: option.attribute.name,
      code: option.attribute.code,
      type: option.attribute.type,
    },
    attributeValue: toProductAttributeValueDto(option.attributeValue),
  };
}

export async function toProductVariantDto(
  variant: VariantWithRelations,
): Promise<ProductVariantDto> {
  const urlMap = await resolveMediaUrlMap([variant.imageId]);

  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    barcode: variant.barcode,
    price: decimalToNumber(variant.price),
    salePrice: decimalToNumber(variant.salePrice),
    stockQuantity: variant.stockQuantity,
    imageId: variant.imageId,
    imageUrl: variant.imageId ? (urlMap.get(variant.imageId) ?? null) : null,
    isActive: variant.isActive,
    options: variant.options.map(toProductVariantOptionDto),
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  };
}

export async function toProductVariantDtos(
  variants: VariantWithRelations[],
): Promise<ProductVariantDto[]> {
  const urlMap = await resolveMediaUrlMap(variants.map((variant) => variant.imageId));

  return variants.map((variant) => ({
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    barcode: variant.barcode,
    price: decimalToNumber(variant.price),
    salePrice: decimalToNumber(variant.salePrice),
    stockQuantity: variant.stockQuantity,
    imageId: variant.imageId,
    imageUrl: variant.imageId ? (urlMap.get(variant.imageId) ?? null) : null,
    isActive: variant.isActive,
    options: variant.options.map(toProductVariantOptionDto),
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  }));
}

export async function toPublicProductVariantDto(
  variant: VariantWithRelations,
): Promise<PublicProductVariantDto> {
  const base = await toProductVariantDto(variant);
  return {
    id: base.id,
    sku: base.sku,
    price: base.price,
    salePrice: base.salePrice,
    stockQuantity: base.stockQuantity,
    imageUrl: base.imageUrl,
    isActive: base.isActive,
    options: base.options.map((option) => ({
      attributeId: option.attributeId,
      attributeCode: option.attribute.code,
      attributeValueId: option.attributeValueId,
      value: option.attributeValue.value,
      colorHex: option.attributeValue.colorHex,
    })),
  };
}

export function buildPublicVariantAttributes(
  variants: VariantWithRelations[],
): PublicVariantAttributeDto[] {
  const map = new Map<string, PublicVariantAttributeDto>();

  for (const variant of variants) {
    if (!variant.isActive) continue;

    for (const option of variant.options) {
      const existing = map.get(option.attributeId);
      const valueEntry = {
        id: option.attributeValue.id,
        value: option.attributeValue.value,
        colorHex: option.attributeValue.colorHex,
      };

      if (!existing) {
        map.set(option.attributeId, {
          attributeId: option.attribute.id,
          name: option.attribute.name,
          code: option.attribute.code,
          type: option.attribute.type,
          values: [valueEntry],
        });
        continue;
      }

      if (!existing.values.some((item) => item.id === valueEntry.id)) {
        existing.values.push(valueEntry);
      }
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function toFilterableAttributeDto(
  attribute: ProductAttribute & { values: ProductAttributeValue[] },
): FilterableAttributeDto {
  return {
    id: attribute.id,
    name: attribute.name,
    code: attribute.code,
    type: attribute.type,
    values: attribute.values.map(toProductAttributeValueDto),
  };
}

export function variantOptionKey(
  options: Array<{ attributeId: string; attributeValueId: string }>,
): string {
  return [...options]
    .sort((a, b) => a.attributeId.localeCompare(b.attributeId))
    .map((option) => `${option.attributeId}:${option.attributeValueId}`)
    .join('|');
}
