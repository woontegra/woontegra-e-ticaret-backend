import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createBlogCategorySchema,
  updateBlogCategorySchema,
} from './blog-category.schema.js';
import * as blogCategoryService from './blog-category.service.js';

export async function listCategories(_req: Request, res: Response) {
  const data = await blogCategoryService.listBlogCategories();
  sendSuccess(res, data);
}

export async function getCategory(req: Request, res: Response) {
  const data = await blogCategoryService.getBlogCategoryById(req.params.id);
  sendSuccess(res, data);
}

export async function createCategory(req: Request, res: Response) {
  const input = createBlogCategorySchema.parse(req.body);
  const data = await blogCategoryService.createBlogCategory(input);
  sendCreated(res, data);
}

export async function updateCategory(req: Request, res: Response) {
  const input = updateBlogCategorySchema.parse(req.body);
  const data = await blogCategoryService.updateBlogCategory(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteCategory(req: Request, res: Response) {
  await blogCategoryService.deleteBlogCategory(req.params.id);
  sendNoContent(res);
}
