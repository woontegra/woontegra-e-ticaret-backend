import type { MailSetting } from '@prisma/client';
import { env } from '../../config/index.js';
import { SETTINGS_SINGLETON_ID } from '../../types/api.js';
import { toMailSettingDto } from '../../lib/mail.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type { UpdateMailSettingInput } from './mail.schema.js';

async function getOrCreate() {
  return prisma.mailSetting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: { id: SETTINGS_SINGLETON_ID },
  });
}

/** Merge optional SMTP_* env vars (bootstrap) over DB values. */
function mergeMailEnv(setting: MailSetting): MailSetting {
  return {
    ...setting,
    smtpHost: env.SMTP_HOST || setting.smtpHost,
    smtpPort: env.SMTP_PORT ?? setting.smtpPort,
    smtpUser: env.SMTP_USER || setting.smtpUser,
    smtpPass: env.SMTP_PASS || setting.smtpPass,
    fromEmail: env.MAIL_FROM_EMAIL || setting.fromEmail,
    fromName: env.MAIL_FROM_NAME || setting.fromName,
    replyTo: env.MAIL_REPLY_TO ?? setting.replyTo,
    isActive: env.MAIL_ACTIVE ?? setting.isActive,
  };
}

export async function getMailSettings() {
  const setting = mergeMailEnv(await getOrCreate());
  return toMailSettingDto(setting, { maskPassword: true });
}

export async function getMailSettingsRaw() {
  return mergeMailEnv(await getOrCreate());
}

export async function updateMailSettings(input: UpdateMailSettingInput) {
  await getOrCreate();

  const setting = await prisma.mailSetting.update({
    where: { id: SETTINGS_SINGLETON_ID },
    data: {
      ...(input.smtpHost !== undefined ? { smtpHost: input.smtpHost } : {}),
      ...(input.smtpPort !== undefined ? { smtpPort: input.smtpPort } : {}),
      ...(input.smtpUser !== undefined ? { smtpUser: input.smtpUser } : {}),
      ...(input.smtpPass !== undefined && input.smtpPass !== ''
        ? { smtpPass: input.smtpPass }
        : {}),
      ...(input.fromName !== undefined ? { fromName: input.fromName } : {}),
      ...(input.fromEmail !== undefined ? { fromEmail: input.fromEmail } : {}),
      ...(input.replyTo !== undefined ? { replyTo: input.replyTo } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toMailSettingDto(mergeMailEnv(setting), { maskPassword: true });
}
