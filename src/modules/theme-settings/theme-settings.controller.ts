import type { Request, Response } from 'express';
import { sendSuccess } from '../../lib/response.js';
import { updateThemeSettingSchema } from './theme-settings.schema.js';
import * as themeSettingsService from './theme-settings.service.js';

export async function getThemeSettings(_req: Request, res: Response) {
  const data = await themeSettingsService.getThemeSettings();
  sendSuccess(res, data);
}

export async function updateThemeSettings(req: Request, res: Response) {
  const input = updateThemeSettingSchema.parse(req.body);
  const data = await themeSettingsService.updateThemeSettings(input);
  sendSuccess(res, data);
}
