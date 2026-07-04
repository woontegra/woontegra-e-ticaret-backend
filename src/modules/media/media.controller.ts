import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  listMediaQuerySchema,
  updateMediaSchema,
  uploadMediaBodySchema,
} from './media.schema.js';
import * as mediaService from './media.service.js';

export async function listMedia(req: Request, res: Response) {
  const query = listMediaQuerySchema.parse(req.query);
  const data = await mediaService.listMedia(query);
  sendSuccess(res, data);
}

export async function listFolders(_req: Request, res: Response) {
  const data = await mediaService.listMediaFolders();
  sendSuccess(res, data);
}

export async function getMedia(req: Request, res: Response) {
  const data = await mediaService.getMediaById(req.params.id);
  sendSuccess(res, data);
}

export async function uploadMedia(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({
      errors: [{ code: 'FILE_REQUIRED', message: 'Dosya gerekli' }],
    });
    return;
  }

  const body = uploadMediaBodySchema.parse(req.body);
  const data = await mediaService.uploadMedia({
    file: req.file,
    folder: body.folder,
    usageType: body.usageType,
    createdById: req.user?.id,
  });

  sendCreated(res, data);
}

export async function updateMedia(req: Request, res: Response) {
  const input = updateMediaSchema.parse(req.body);
  const data = await mediaService.updateMedia(req.params.id, input);
  sendSuccess(res, data);
}

export async function deleteMedia(req: Request, res: Response) {
  await mediaService.deleteMedia(req.params.id);
  sendNoContent(res);
}
