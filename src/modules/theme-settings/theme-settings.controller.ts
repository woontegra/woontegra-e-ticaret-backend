import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendSuccess } from '../../lib/response.js';
import { updateThemeSettingSchema } from './theme-settings.schema.js';
import * as themeSettingsService from './theme-settings.service.js';

export async function getThemeSettings(_req: Request, res: Response) {
  const data = await themeSettingsService.getThemeSettings();
  sendSuccess(res, data);
}

export async function updateThemeSettings(req: Request, res: Response) {
  const before = await themeSettingsService.getThemeSettings();
  const input = updateThemeSettingSchema.parse(req.body);
  const data = await themeSettingsService.updateThemeSettings(input);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.THEME_UPDATE,
    module: 'theme',
    entityType: 'theme_setting',
    entityId: data.id,
    beforeData: { activeThemeKey: before.activeThemeKey },
    afterData: { activeThemeKey: data.activeThemeKey },
  });
  sendSuccess(res, data);
}
