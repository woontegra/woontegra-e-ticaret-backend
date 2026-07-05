import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as catalogController from './catalog.controller.js';

export const productCategoriesAdminRouter = Router();
export const brandsAdminRouter = Router();
export const productAttributesAdminRouter = Router();
export const productsAdminRouter = Router();
export const catalogPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');
const productAdminRoles = requireRoles(
  'SUPER_ADMIN',
  'ADMIN',
  'ADMIN',
  'STAFF',
);

productCategoriesAdminRouter.use(requireAuth, adminRoles);
productCategoriesAdminRouter.get(
  '/',
  asyncHandler(catalogController.listCategories),
);
productCategoriesAdminRouter.post(
  '/',
  asyncHandler(catalogController.createCategory),
);
productCategoriesAdminRouter.get(
  '/:id',
  asyncHandler(catalogController.getCategory),
);
productCategoriesAdminRouter.put(
  '/:id',
  asyncHandler(catalogController.updateCategory),
);
productCategoriesAdminRouter.delete(
  '/:id',
  asyncHandler(catalogController.deleteCategory),
);

brandsAdminRouter.use(requireAuth, adminRoles);
brandsAdminRouter.get('/', asyncHandler(catalogController.listBrands));
brandsAdminRouter.post('/', asyncHandler(catalogController.createBrand));
brandsAdminRouter.get('/:id', asyncHandler(catalogController.getBrand));
brandsAdminRouter.put('/:id', asyncHandler(catalogController.updateBrand));
brandsAdminRouter.delete('/:id', asyncHandler(catalogController.deleteBrand));

productsAdminRouter.use(requireAuth, productAdminRoles);
productsAdminRouter.get('/', asyncHandler(catalogController.listProducts));
productsAdminRouter.post('/', asyncHandler(catalogController.createProduct));
productsAdminRouter.get(
  '/:id/attribute-assignments',
  asyncHandler(catalogController.listProductAttributeAssignments),
);
productsAdminRouter.put(
  '/:id/attribute-assignments',
  asyncHandler(catalogController.saveProductAttributeAssignments),
);
productsAdminRouter.get(
  '/:id/variants',
  asyncHandler(catalogController.listProductVariants),
);
productsAdminRouter.post(
  '/:id/variants',
  asyncHandler(catalogController.createProductVariant),
);
productsAdminRouter.post(
  '/:id/variants/generate',
  asyncHandler(catalogController.generateProductVariants),
);
productsAdminRouter.put(
  '/:id/variants/:variantId',
  asyncHandler(catalogController.updateProductVariant),
);
productsAdminRouter.delete(
  '/:id/variants/:variantId',
  asyncHandler(catalogController.deleteProductVariant),
);
productsAdminRouter.get('/:id', asyncHandler(catalogController.getProduct));
productsAdminRouter.put('/:id', asyncHandler(catalogController.updateProduct));
productsAdminRouter.delete(
  '/:id',
  asyncHandler(catalogController.deleteProduct),
);

productAttributesAdminRouter.use(requireAuth, adminRoles);
productAttributesAdminRouter.get(
  '/',
  asyncHandler(catalogController.listProductAttributes),
);
productAttributesAdminRouter.post(
  '/',
  asyncHandler(catalogController.createProductAttribute),
);
productAttributesAdminRouter.get(
  '/:id',
  asyncHandler(catalogController.getProductAttribute),
);
productAttributesAdminRouter.put(
  '/:id',
  asyncHandler(catalogController.updateProductAttribute),
);
productAttributesAdminRouter.delete(
  '/:id',
  asyncHandler(catalogController.deleteProductAttribute),
);
productAttributesAdminRouter.post(
  '/:id/values',
  asyncHandler(catalogController.createProductAttributeValue),
);
productAttributesAdminRouter.put(
  '/:id/values/:valueId',
  asyncHandler(catalogController.updateProductAttributeValue),
);
productAttributesAdminRouter.delete(
  '/:id/values/:valueId',
  asyncHandler(catalogController.deleteProductAttributeValue),
);

catalogPublicRouter.get(
  '/brands',
  asyncHandler(catalogController.listPublicBrands),
);
catalogPublicRouter.get(
  '/brands/:slug',
  asyncHandler(catalogController.getPublicBrand),
);
catalogPublicRouter.get(
  '/filter-attributes',
  asyncHandler(catalogController.listFilterableAttributes),
);
catalogPublicRouter.get(
  '/products',
  asyncHandler(catalogController.listPublicProducts),
);
catalogPublicRouter.get(
  '/products/:slug',
  asyncHandler(catalogController.getPublicProduct),
);
catalogPublicRouter.get(
  '/categories',
  asyncHandler(catalogController.listPublicCategories),
);
catalogPublicRouter.get(
  '/categories/:slug',
  asyncHandler(catalogController.getPublicCategory),
);
