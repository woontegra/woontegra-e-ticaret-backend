import type { MailLog, MailSetting, MailTemplate, Prisma } from '@prisma/client';
import type {
  MailLogDto,
  MailSettingDto,
  MailTemplateDto,
  MailTemplateVariableDto,
} from '../types/api.js';

export function toMailSettingDto(
  setting: MailSetting,
  options?: { maskPassword?: boolean },
): MailSettingDto {
  return {
    id: setting.id,
    smtpHost: setting.smtpHost,
    smtpPort: setting.smtpPort,
    smtpUser: setting.smtpUser,
    hasSmtpPass: Boolean(setting.smtpPass),
    smtpPass: options?.maskPassword ? undefined : setting.smtpPass || undefined,
    fromName: setting.fromName,
    fromEmail: setting.fromEmail,
    replyTo: setting.replyTo,
    isActive: setting.isActive,
    createdAt: setting.createdAt.toISOString(),
    updatedAt: setting.updatedAt.toISOString(),
  };
}

export function parseTemplateVariables(value: Prisma.JsonValue): MailTemplateVariableDto[] {
  if (!Array.isArray(value)) return [];
  const result: MailTemplateVariableDto[] = [];
  for (const item of value) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'name' in item &&
      typeof (item as { name: unknown }).name === 'string'
    ) {
      const record = item as { name: string; description?: unknown };
      result.push({
        name: record.name,
        description:
          typeof record.description === 'string' ? record.description : '',
      });
    }
  }
  return result;
}

export function toMailTemplateDto(template: MailTemplate): MailTemplateDto {
  return {
    id: template.id,
    key: template.key,
    name: template.name,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    variables: parseTemplateVariables(template.variables),
    isActive: template.isActive,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

export function toMailLogDto(log: MailLog): MailLogDto {
  return {
    id: log.id,
    toEmail: log.toEmail,
    subject: log.subject,
    templateKey: log.templateKey,
    status: log.status,
    errorMessage: log.errorMessage,
    createdAt: log.createdAt.toISOString(),
  };
}
