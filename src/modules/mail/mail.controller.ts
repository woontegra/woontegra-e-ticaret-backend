import type { Request, Response } from 'express';
import { AUDIT_ACTIONS, auditFromRequest } from '../../lib/audit.js';
import { sendCreated, sendSuccess } from '../../lib/response.js';
import {
  sendTestMailSchema,
  updateMailSettingSchema,
  updateMailTemplateSchema,
} from './mail.schema.js';
import * as mailSettingService from './mail-setting.service.js';
import * as mailTemplateService from './mail-template.service.js';
import * as mailService from './mail.service.js';

export async function getMailSettings(_req: Request, res: Response) {
  const data = await mailSettingService.getMailSettings();
  sendSuccess(res, data);
}

export async function updateMailSettings(req: Request, res: Response) {
  const input = updateMailSettingSchema.parse(req.body);
  const data = await mailSettingService.updateMailSettings(input);
  auditFromRequest(req, {
    action: AUDIT_ACTIONS.MAIL_SETTING_UPDATE,
    module: 'mail',
    entityType: 'mail_setting',
    entityId: data.id,
    afterData: {
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUser: data.smtpUser,
      fromName: data.fromName,
      fromEmail: data.fromEmail,
    },
  });
  sendSuccess(res, data);
}

export async function listMailTemplates(_req: Request, res: Response) {
  const data = await mailTemplateService.listMailTemplates();
  sendSuccess(res, data);
}

export async function getMailTemplate(req: Request, res: Response) {
  const data = await mailTemplateService.getMailTemplateById(req.params.id);
  sendSuccess(res, data);
}

export async function updateMailTemplate(req: Request, res: Response) {
  const input = updateMailTemplateSchema.parse(req.body);
  const data = await mailTemplateService.updateMailTemplate(
    req.params.id,
    input,
  );
  sendSuccess(res, data);
}

export async function sendTestMail(req: Request, res: Response) {
  const input = sendTestMailSchema.parse(req.body);
  const result = await mailService.sendTestMail(
    input.toEmail,
    input.templateKey,
  );
  sendCreated(res, result);
}

export async function listMailLogs(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const data = await mailService.listMailLogs(limit);
  sendSuccess(res, data);
}
