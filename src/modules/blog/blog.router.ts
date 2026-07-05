import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as blogCategoryController from './blog-category.controller.js';
import * as blogPostController from './blog-post.controller.js';

export const blogCategoriesAdminRouter = Router();
export const blogPostsAdminRouter = Router();
export const blogPublicRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN', 'EDITOR');

blogCategoriesAdminRouter.use(requireAuth, adminRoles);
blogCategoriesAdminRouter.get('/', asyncHandler(blogCategoryController.listCategories));
blogCategoriesAdminRouter.post('/', asyncHandler(blogCategoryController.createCategory));
blogCategoriesAdminRouter.get('/:id', asyncHandler(blogCategoryController.getCategory));
blogCategoriesAdminRouter.put('/:id', asyncHandler(blogCategoryController.updateCategory));
blogCategoriesAdminRouter.delete('/:id', asyncHandler(blogCategoryController.deleteCategory));

blogPostsAdminRouter.use(requireAuth, adminRoles);
blogPostsAdminRouter.get('/', asyncHandler(blogPostController.listPosts));
blogPostsAdminRouter.post('/', asyncHandler(blogPostController.createPost));
blogPostsAdminRouter.get('/:id', asyncHandler(blogPostController.getPost));
blogPostsAdminRouter.put('/:id', asyncHandler(blogPostController.updatePost));
blogPostsAdminRouter.delete('/:id', asyncHandler(blogPostController.deletePost));
blogPostsAdminRouter.post('/:id/publish', asyncHandler(blogPostController.publishPost));
blogPostsAdminRouter.post('/:id/unpublish', asyncHandler(blogPostController.unpublishPost));

blogPublicRouter.get('/posts', asyncHandler(blogPostController.listPublicPosts));
blogPublicRouter.get('/posts/:slug', asyncHandler(blogPostController.getPublicPost));
