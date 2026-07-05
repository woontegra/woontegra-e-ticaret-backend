import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from './product-category.schema.js';
import * as productCategoryService from './product-category.service.js';
import { createBrandSchema, updateBrandSchema } from './brand.schema.js';
import * as brandService from './brand.service.js';
import {
  createProductSchema,
  listProductsQuerySchema,
  publicCategoriesQuerySchema,
  publicProductsQuerySchema,
  updateProductSchema,
} from './product.schema.js';
import * as productService from './product.service.js';
import {
  createProductAttributeSchema,
  createProductAttributeValueSchema,
  updateProductAttributeSchema,
  updateProductAttributeValueSchema,
} from './product-attribute.schema.js';
import * as productAttributeService from './product-attribute.service.js';
import {
  createProductVariantSchema,
  generateProductVariantsSchema,
  saveProductAttributeAssignmentsSchema,
  updateProductVariantSchema,
} from './product-variant.schema.js';
import * as productVariantService from './product-variant.service.js';

export async function listCategories(_req: Request, res: Response) {
  const data = await productCategoryService.listProductCategories();
  sendSuccess(res, data);
}

export async function getCategory(req: Request, res: Response) {
  const data = await productCategoryService.getProductCategoryById(
    req.params.id,
  );
  sendSuccess(res, data);
}

export async function createCategory(req: Request, res: Response) {
  const input = createProductCategorySchema.parse(req.body);
  const data = await productCategoryService.createProductCategory(input);
  sendCreated(res, data);
}

export async function updateCategory(req: Request, res: Response) {
  const input = updateProductCategorySchema.parse(req.body);
  const data = await productCategoryService.updateProductCategory(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteCategory(req: Request, res: Response) {
  await productCategoryService.deleteProductCategory(req.params.id);
  sendNoContent(res);
}

export async function listBrands(_req: Request, res: Response) {
  const data = await brandService.listBrands();
  sendSuccess(res, data);
}

export async function getBrand(req: Request, res: Response) {
  const data = await brandService.getBrandById(req.params.id);
  sendSuccess(res, data);
}

export async function createBrand(req: Request, res: Response) {
  const input = createBrandSchema.parse(req.body);
  const data = await brandService.createBrand(input);
  sendCreated(res, data);
}

export async function updateBrand(req: Request, res: Response) {
  const input = updateBrandSchema.parse(req.body);
  const data = await brandService.updateBrand(req.params.id, input);
  sendSuccess(res, data);
}

export async function deleteBrand(req: Request, res: Response) {
  await brandService.deleteBrand(req.params.id);
  sendNoContent(res);
}

export async function listProducts(req: Request, res: Response) {
  const query = listProductsQuerySchema.parse(req.query);
  const data = await productService.listProducts(query);
  sendSuccess(res, data);
}

export async function getProduct(req: Request, res: Response) {
  const data = await productService.getProductById(req.params.id);
  sendSuccess(res, data);
}

export async function createProduct(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  const data = await productService.createProduct(input);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.PRODUCT_CREATE,
    module: 'catalog',
    entityType: 'product',
    entityId: data.id,
    afterData: { id: data.id, name: data.name, slug: data.slug, status: data.status },
  });
  sendCreated(res, data);
}

export async function updateProduct(req: Request, res: Response) {
  const existing = await productService.getProductById(req.params.id);
  const input = updateProductSchema.parse(req.body);
  const data = await productService.updateProduct(req.params.id, input);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.PRODUCT_UPDATE,
    module: 'catalog',
    entityType: 'product',
    entityId: data.id,
    beforeData: { id: existing.id, name: existing.name, slug: existing.slug, status: existing.status },
    afterData: { id: data.id, name: data.name, slug: data.slug, status: data.status },
  });
  sendSuccess(res, data);
}

export async function deleteProduct(req: Request, res: Response) {
  const existing = await productService.getProductById(req.params.id);
  await productService.deleteProduct(req.params.id);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.PRODUCT_DELETE,
    module: 'catalog',
    entityType: 'product',
    entityId: existing.id,
    beforeData: { id: existing.id, name: existing.name, slug: existing.slug, status: existing.status },
  });
  sendNoContent(res);
}

export async function listPublicProducts(req: Request, res: Response) {
  const query = publicProductsQuerySchema.parse(req.query);
  const data = await productService.listPublicProducts(query);
  sendSuccess(res, data);
}

export async function getPublicProduct(req: Request, res: Response) {
  const data = await productService.getPublicProductBySlug(req.params.slug);
  sendSuccess(res, data);
}

export async function listPublicCategories(req: Request, res: Response) {
  const query = publicCategoriesQuerySchema.parse(req.query);
  const data = await productCategoryService.listPublicProductCategories(query);
  sendSuccess(res, data);
}

export async function getPublicCategory(req: Request, res: Response) {
  const data = await productCategoryService.getPublicProductCategoryBySlug(
    req.params.slug,
  );
  sendSuccess(res, data);
}

export async function listProductAttributes(_req: Request, res: Response) {
  const data = await productAttributeService.listProductAttributes();
  sendSuccess(res, data);
}

export async function getProductAttribute(req: Request, res: Response) {
  const data = await productAttributeService.getProductAttributeById(
    req.params.id,
  );
  sendSuccess(res, data);
}

export async function createProductAttribute(req: Request, res: Response) {
  const input = createProductAttributeSchema.parse(req.body);
  const data = await productAttributeService.createProductAttribute(input);
  sendCreated(res, data);
}

export async function updateProductAttribute(req: Request, res: Response) {
  const input = updateProductAttributeSchema.parse(req.body);
  const data = await productAttributeService.updateProductAttribute(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteProductAttribute(req: Request, res: Response) {
  await productAttributeService.deleteProductAttribute(req.params.id);
  sendNoContent(res);
}

export async function createProductAttributeValue(req: Request, res: Response) {
  const input = createProductAttributeValueSchema.parse(req.body);
  const data = await productAttributeService.createProductAttributeValue(
    req.params.id,
    input,
  );
  sendCreated(res, data);
}

export async function updateProductAttributeValue(req: Request, res: Response) {
  const input = updateProductAttributeValueSchema.parse(req.body);
  const data = await productAttributeService.updateProductAttributeValue(
    req.params.id,
    req.params.valueId,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteProductAttributeValue(req: Request, res: Response) {
  await productAttributeService.deleteProductAttributeValue(
    req.params.id,
    req.params.valueId,
  );
  sendNoContent(res);
}

export async function listProductAttributeAssignments(req: Request, res: Response) {
  const data = await productAttributeService.listProductAttributeAssignments(
    req.params.id,
  );
  sendSuccess(res, data);
}

export async function saveProductAttributeAssignments(req: Request, res: Response) {
  const input = saveProductAttributeAssignmentsSchema.parse(req.body);
  const data = await productAttributeService.saveProductAttributeAssignments(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function listProductVariants(req: Request, res: Response) {
  const data = await productVariantService.listProductVariants(req.params.id);
  sendSuccess(res, data);
}

export async function createProductVariant(req: Request, res: Response) {
  const input = createProductVariantSchema.parse(req.body);
  const data = await productVariantService.createProductVariant(
    req.params.id,
    input,
  );
  sendCreated(res, data);
}

export async function updateProductVariant(req: Request, res: Response) {
  const input = updateProductVariantSchema.parse(req.body);
  const data = await productVariantService.updateProductVariant(
    req.params.id,
    req.params.variantId,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteProductVariant(req: Request, res: Response) {
  await productVariantService.deleteProductVariant(
    req.params.id,
    req.params.variantId,
  );
  sendNoContent(res);
}

export async function generateProductVariants(req: Request, res: Response) {
  const input = generateProductVariantsSchema.parse(req.body);
  const data = await productVariantService.generateProductVariants(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function listFilterableAttributes(_req: Request, res: Response) {
  const data = await productAttributeService.listFilterableAttributes();
  sendSuccess(res, data);
}

export async function listPublicBrands(_req: Request, res: Response) {
  const data = await brandService.listPublicBrands();
  sendSuccess(res, data);
}

export async function getPublicBrand(req: Request, res: Response) {
  const data = await brandService.getPublicBrandBySlug(req.params.slug);
  sendSuccess(res, data);
}
