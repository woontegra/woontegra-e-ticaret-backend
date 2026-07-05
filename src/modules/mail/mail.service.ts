import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { MailLogStatus } from '@prisma/client';
import { toMailLogDto } from '../../lib/mail.mapper.js';
import { renderTemplate, stripHtml } from '../../lib/template-render.js';
import { prisma } from '../../lib/prisma.js';
import { getMailSettingsRaw } from './mail-setting.service.js';
import { getMailTemplateByKey } from './mail-template.service.js';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string | null;
  templateKey?: string | null;
}

export interface SendTemplateMailResult {
  sent: boolean;
  skipped?: boolean;
  logId?: string;
  error?: string;
}

async function createTransport(settings: {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
}): Promise<Transporter> {
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    auth:
      settings.smtpUser && settings.smtpPass
        ? {
            user: settings.smtpUser,
            pass: settings.smtpPass,
          }
        : undefined,
  });
}

export async function sendMail(options: SendMailOptions): Promise<SendTemplateMailResult> {
  const settings = await getMailSettingsRaw();

  const log = await prisma.mailLog.create({
    data: {
      toEmail: options.to,
      subject: options.subject,
      templateKey: options.templateKey ?? null,
      status: MailLogStatus.PENDING,
    },
  });

  if (!settings.isActive) {
    await prisma.mailLog.update({
      where: { id: log.id },
      data: {
        status: MailLogStatus.SKIPPED,
        errorMessage: 'Mail settings inactive',
      },
    });
    return { sent: false, skipped: true, logId: log.id };
  }

  if (!settings.smtpHost || !settings.fromEmail) {
    await prisma.mailLog.update({
      where: { id: log.id },
      data: {
        status: MailLogStatus.FAILED,
        errorMessage: 'SMTP configuration incomplete',
      },
    });
    return {
      sent: false,
      logId: log.id,
      error: 'SMTP configuration incomplete',
    };
  }

  try {
    const transporter = await createTransport(settings);
    await transporter.sendMail({
      from: settings.fromName
        ? `"${settings.fromName}" <${settings.fromEmail}>`
        : settings.fromEmail,
      to: options.to,
      replyTo: settings.replyTo ?? undefined,
      subject: options.subject,
      html: options.html,
      text: options.text ?? stripHtml(options.html),
    });

    await prisma.mailLog.update({
      where: { id: log.id },
      data: { status: MailLogStatus.SENT, errorMessage: null },
    });

    return { sent: true, logId: log.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Mail send failed';
    await prisma.mailLog.update({
      where: { id: log.id },
      data: { status: MailLogStatus.FAILED, errorMessage: message },
    });
    return { sent: false, logId: log.id, error: message };
  }
}

export async function sendTemplateMail(
  templateKey: string,
  to: string,
  variables: Record<string, string>,
): Promise<SendTemplateMailResult> {
  const template = await getMailTemplateByKey(templateKey);

  if (!template) {
    return { sent: false, error: `Template not found: ${templateKey}` };
  }

  if (!template.isActive) {
    const log = await prisma.mailLog.create({
      data: {
        toEmail: to,
        subject: template.subject,
        templateKey,
        status: MailLogStatus.SKIPPED,
        errorMessage: 'Template inactive',
      },
    });
    return { sent: false, skipped: true, logId: log.id };
  }

  const subject = renderTemplate(template.subject, variables);
  const html = renderTemplate(template.htmlContent, variables);
  const text = template.textContent
    ? renderTemplate(template.textContent, variables)
    : null;

  return sendMail({
    to,
    subject,
    html,
    text,
    templateKey,
  });
}

export async function listMailLogs(limit = 50) {
  const logs = await prisma.mailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return logs.map(toMailLogDto);
}

export async function sendTestMail(toEmail: string, templateKey?: string) {
  if (templateKey) {
    const sampleVariables: Record<string, string> = {
      customerName: 'Test Müşteri',
      orderNumber: 'W20250705-1234',
      grandTotal: '1.234,56 ₺',
      siteName: 'Woontegra Demo',
      orderItemsHtml:
        '<table style="width:100%;border-collapse:collapse"><tr><td>Demo Ürün × 1</td><td>999,00 ₺</td></tr></table>',
      bankInfoHtml: '<p>Demo Bank — TR00 0000 0000 0000 0000 0000 00</p>',
      bankInfoText: 'Demo Bank — TR00 0000 0000 0000 0000 0000 00',
      carrierName: 'Demo Kargo',
      trackingNumber: 'DEMO123456',
      trackingUrl: 'https://example.com/track/DEMO123456',
      resetUrl: 'https://example.com/reset/demo-token',
      name: 'Test Kullanıcı',
      message: 'Bu bir test mesajıdır.',
      replyMessage: 'Test yanıt metni.',
      productName: 'Demo Yazılım',
    };
    return sendTemplateMail(templateKey, toEmail, sampleVariables);
  }

  return sendMail({
    to: toEmail,
    subject: 'Woontegra — Test e-postası',
    html: '<p>Bu bir test e-postasıdır. SMTP ayarlarınız çalışıyor.</p>',
    text: 'Bu bir test e-postasıdır. SMTP ayarlarınız çalışıyor.',
    templateKey: null,
  });
}
