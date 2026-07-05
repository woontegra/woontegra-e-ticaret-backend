import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/response.js';
import {
  createFooterColumnSchema,
  updateFooterColumnSchema,
} from './footer-column.schema.js';
import * as footerColumnService from './footer-column.service.js';
import {
  createFooterLinkSchema,
  updateFooterLinkSchema,
} from './footer-link.schema.js';
import * as footerLinkService from './footer-link.service.js';
import { updateFooterSettingSchema } from './footer-setting.schema.js';
import * as footerSettingService from './footer-setting.service.js';

export async function getFooterSettings(_req: Request, res: Response) {
  const data = await footerSettingService.getFooterSettings();
  sendSuccess(res, data);
}

export async function updateFooterSettings(req: Request, res: Response) {
  const input = updateFooterSettingSchema.parse(req.body);
  const data = await footerSettingService.updateFooterSettings(input);
  sendSuccess(res, data);
}

export async function listFooterColumns(_req: Request, res: Response) {
  const data = await footerColumnService.listFooterColumns();
  sendSuccess(res, data);
}

export async function listFooterColumnsWithLinks(_req: Request, res: Response) {
  const data = await footerSettingService.listFooterColumnsWithLinks();
  sendSuccess(res, data);
}

export async function getFooterColumn(req: Request, res: Response) {
  const data = await footerColumnService.getFooterColumnById(req.params.id);
  sendSuccess(res, data);
}

export async function createFooterColumn(req: Request, res: Response) {
  const input = createFooterColumnSchema.parse(req.body);
  const data = await footerColumnService.createFooterColumn(input);
  sendCreated(res, data);
}

export async function updateFooterColumn(req: Request, res: Response) {
  const input = updateFooterColumnSchema.parse(req.body);
  const data = await footerColumnService.updateFooterColumn(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function deleteFooterColumn(req: Request, res: Response) {
  await footerColumnService.deleteFooterColumn(req.params.id);
  sendNoContent(res);
}

export async function listFooterLinks(req: Request, res: Response) {
  const data = await footerLinkService.listFooterLinks(req.params.columnId);
  sendSuccess(res, data);
}

export async function createFooterLink(req: Request, res: Response) {
  const input = createFooterLinkSchema.parse(req.body);
  const data = await footerLinkService.createFooterLink(
    req.params.columnId,
    input,
  );
  sendCreated(res, data);
}

export async function updateFooterLink(req: Request, res: Response) {
  const input = updateFooterLinkSchema.parse(req.body);
  const data = await footerLinkService.updateFooterLink(req.params.id, input);
  sendSuccess(res, data);
}

export async function deleteFooterLink(req: Request, res: Response) {
  await footerLinkService.deleteFooterLink(req.params.id);
  sendNoContent(res);
}

export async function getPublicFooter(_req: Request, res: Response) {
  const data = await footerSettingService.getPublicFooter();
  sendSuccess(res, data);
}
