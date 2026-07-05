import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createBlogPostSchema,
  listBlogPostsQuerySchema,
  publicBlogPostsQuerySchema,
  updateBlogPostSchema,
} from './blog-post.schema.js';
import * as blogPostService from './blog-post.service.js';

export async function listPosts(req: Request, res: Response) {
  const query = listBlogPostsQuerySchema.parse(req.query);
  const data = await blogPostService.listBlogPosts(query);
  sendSuccess(res, data);
}

export async function listPublicPosts(req: Request, res: Response) {
  const query = publicBlogPostsQuerySchema.parse(req.query);
  const data = await blogPostService.listPublicBlogPosts(query);
  sendSuccess(res, data);
}

export async function getPost(req: Request, res: Response) {
  const data = await blogPostService.getBlogPostById(req.params.id);
  sendSuccess(res, data);
}

export async function getPublicPost(req: Request, res: Response) {
  const data = await blogPostService.getPublishedBlogPostBySlug(
    req.params.slug,
  );
  sendSuccess(res, data);
}

export async function createPost(req: Request, res: Response) {
  const input = createBlogPostSchema.parse(req.body);
  const data = await blogPostService.createBlogPost(input, req.user?.id);
  sendCreated(res, data);
}

export async function updatePost(req: Request, res: Response) {
  const input = updateBlogPostSchema.parse(req.body);
  const data = await blogPostService.updateBlogPost(
    req.params.id,
    input,
    req.user?.id,
  );
  sendSuccess(res, data);
}

export async function deletePost(req: Request, res: Response) {
  await blogPostService.deleteBlogPost(req.params.id);
  sendNoContent(res);
}

export async function publishPost(req: Request, res: Response) {
  const data = await blogPostService.publishBlogPost(
    req.params.id,
    req.user?.id,
  );
  sendSuccess(res, data);
}

export async function unpublishPost(req: Request, res: Response) {
  const data = await blogPostService.unpublishBlogPost(
    req.params.id,
    req.user?.id,
  );
  sendSuccess(res, data);
}
