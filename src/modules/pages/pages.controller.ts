import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createPageSchema,
  listPagesQuerySchema,
  updatePageSchema,
} from './pages.schema.js';
import * as pagesService from './pages.service.js';

export async function listPages(req: Request, res: Response) {
  const query = listPagesQuerySchema.parse(req.query);
  const data = await pagesService.listPages(query);
  sendSuccess(res, data);
}

export async function getPage(req: Request, res: Response) {
  const data = await pagesService.getPageById(req.params.id);
  sendSuccess(res, data);
}

export async function getPublicPage(req: Request, res: Response) {
  const data = await pagesService.getPublishedPageBySlug(req.params.slug);
  sendSuccess(res, data);
}

export async function createPage(req: Request, res: Response) {
  const input = createPageSchema.parse(req.body);
  const data = await pagesService.createPage(input, req.user?.id);
  sendCreated(res, data);
}

export async function updatePage(req: Request, res: Response) {
  const input = updatePageSchema.parse(req.body);
  const data = await pagesService.updatePage(req.params.id, input, req.user?.id);
  sendSuccess(res, data);
}

export async function deletePage(req: Request, res: Response) {
  await pagesService.deletePage(req.params.id);
  sendNoContent(res);
}

export async function publishPage(req: Request, res: Response) {
  const data = await pagesService.publishPage(req.params.id, req.user?.id);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.PAGE_PUBLISH,
    module: 'pages',
    entityType: 'page',
    entityId: data.id,
    afterData: { id: data.id, title: data.title, slug: data.slug, status: data.status },
  });
  sendSuccess(res, data);
}

export async function unpublishPage(req: Request, res: Response) {
  const data = await pagesService.unpublishPage(req.params.id, req.user?.id);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.PAGE_UNPUBLISH,
    module: 'pages',
    entityType: 'page',
    entityId: data.id,
    afterData: { id: data.id, title: data.title, slug: data.slug, status: data.status },
  });
  sendSuccess(res, data);
}
