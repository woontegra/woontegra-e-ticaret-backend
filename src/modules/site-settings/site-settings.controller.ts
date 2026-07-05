import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendSuccess } from '../../lib/response.js';
import { updateSiteSettingSchema } from './site-settings.schema.js';
import * as siteSettingsService from './site-settings.service.js';

export async function getSiteSettings(_req: Request, res: Response) {
  const data = await siteSettingsService.getSiteSettings();
  sendSuccess(res, data);
}

export async function updateSiteSettings(req: Request, res: Response) {
  const before = await siteSettingsService.getSiteSettings();
  const input = updateSiteSettingSchema.parse(req.body);
  const data = await siteSettingsService.updateSiteSettings(input);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.SITE_SETTING_UPDATE,
    module: 'settings',
    entityType: 'site_setting',
    entityId: data.id,
    beforeData: { siteName: before.siteName, maintenanceMode: before.maintenanceMode },
    afterData: { siteName: data.siteName, maintenanceMode: data.maintenanceMode },
  });
  sendSuccess(res, data);
}
