import type { Request, Response } from 'express';
import { sendSuccess } from '../../lib/response.js';
import { updateCompanySettingSchema } from './company-settings.schema.js';
import * as companySettingsService from './company-settings.service.js';

export async function getCompanySettings(_req: Request, res: Response) {
  const data = await companySettingsService.getCompanySettings();
  sendSuccess(res, data);
}

export async function updateCompanySettings(req: Request, res: Response) {
  const input = updateCompanySettingSchema.parse(req.body);
  const data = await companySettingsService.updateCompanySettings(input);
  sendSuccess(res, data);
}
