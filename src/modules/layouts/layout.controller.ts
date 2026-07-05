import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createPageBlockSchema,
  reorderLayoutBlocksSchema,
  updateHomeDraftSchema,
  updatePageBlockSchema,
} from './layout.schema.js';
import * as layoutService from './layout.service.js';

export async function getHomeDraft(_req: Request, res: Response) {
  const data = await layoutService.getOrCreateHomeDraft();
  sendSuccess(res, data);
}

export async function updateHomeDraft(req: Request, res: Response) {
  const input = updateHomeDraftSchema.parse(req.body);
  const data = await layoutService.updateHomeDraft(input);
  sendSuccess(res, data);
}

export async function createBlock(req: Request, res: Response) {
  const input = createPageBlockSchema.parse(req.body);
  const data = await layoutService.createLayoutBlock(req.params.id, input);
  sendCreated(res, data);
}

export async function updateBlock(req: Request, res: Response) {
  const input = updatePageBlockSchema.parse(req.body);
  const data = await layoutService.updateLayoutBlock(
    req.params.layoutId,
    req.params.blockId,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteBlock(req: Request, res: Response) {
  await layoutService.deleteLayoutBlock(
    req.params.layoutId,
    req.params.blockId,
  );
  sendNoContent(res);
}

export async function reorderBlocks(req: Request, res: Response) {
  const input = reorderLayoutBlocksSchema.parse(req.body);
  const data = await layoutService.reorderLayoutBlocks(req.params.id, input);
  sendSuccess(res, data);
}

export async function publishLayout(req: Request, res: Response) {
  const data = await layoutService.publishLayout(req.params.id);
  sendSuccess(res, data);
}

export async function getPublicHomeLayout(_req: Request, res: Response) {
  const data = await layoutService.getPublicHomeLayout();
  sendSuccess(res, data);
}
