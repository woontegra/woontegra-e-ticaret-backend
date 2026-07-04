import type { Request, Response } from 'express';
import { sendSuccess } from '../../lib/response.js';
import { updateSiteSettingSchema } from './site-settings.schema.js';
import * as siteSettingsService from './site-settings.service.js';

export async function getSiteSettings(_req: Request, res: Response) {
  const data = await siteSettingsService.getSiteSettings();
  sendSuccess(res, data);
}

export async function updateSiteSettings(req: Request, res: Response) {
  const input = updateSiteSettingSchema.parse(req.body);
  const data = await siteSettingsService.updateSiteSettings(input);
  sendSuccess(res, data);
}
