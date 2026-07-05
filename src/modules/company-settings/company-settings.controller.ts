import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendSuccess } from '../../lib/response.js';
import { updateCompanySettingSchema } from './company-settings.schema.js';
import * as companySettingsService from './company-settings.service.js';

export async function getCompanySettings(_req: Request, res: Response) {
  const data = await companySettingsService.getCompanySettings();
  sendSuccess(res, data);
}

export async function updateCompanySettings(req: Request, res: Response) {
  const before = await companySettingsService.getCompanySettings();
  const input = updateCompanySettingSchema.parse(req.body);
  const data = await companySettingsService.updateCompanySettings(input);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.COMPANY_SETTING_UPDATE,
    module: 'settings',
    entityType: 'company_setting',
    entityId: data.id,
    beforeData: { companyName: before.companyName, email: before.email },
    afterData: { companyName: data.companyName, email: data.email },
  });
  sendSuccess(res, data);
}
