import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendSuccess } from '../../lib/response.js';
import { updateHeaderSettingSchema } from './header-settings.schema.js';
import * as headerSettingsService from './header-settings.service.js';

export async function getHeaderSettings(_req: Request, res: Response) {
  const data = await headerSettingsService.getHeaderSettings();
  sendSuccess(res, data);
}

export async function updateHeaderSettings(req: Request, res: Response) {
  const input = updateHeaderSettingSchema.parse(req.body);
  const data = await headerSettingsService.updateHeaderSettings(input);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.HEADER_UPDATE,
    module: 'theme',
    entityType: 'header_setting',
    entityId: data.id,
    afterData: { stickyHeader: data.stickyHeader, logoPosition: data.logoPosition },
  });
  sendSuccess(res, data);
}
