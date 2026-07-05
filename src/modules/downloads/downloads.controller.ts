import type { Request, Response } from 'express';
import {
  handleFreeDownload,
  handlePaidDownload,
} from '../commerce/digitalDelivery.service.js';

export async function downloadFree(req: Request, res: Response) {
  await handleFreeDownload(req.params.productSlug, req.params.fileType, req, res);
}

export async function downloadPaid(req: Request, res: Response) {
  await handlePaidDownload(req.params.token, req, res);
}
