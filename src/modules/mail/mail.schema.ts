import { z } from 'zod';
import { optionalSanitizedHtml } from '../../lib/html-sanitize.js';

const templateVariableSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).default(''),
});

export const updateMailSettingSchema = z.object({
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.coerce.number().int().min(1).max(65535).optional(),
  smtpUser: z.string().max(255).optional(),
  smtpPass: z.string().max(500).optional(),
  fromName: z.string().max(120).optional(),
  fromEmail: z.string().email().max(200).optional(),
  replyTo: z.string().email().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateMailTemplateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  subject: z.string().min(1).max(300).optional(),
  htmlContent: z
    .string()
    .min(1)
    .optional()
    .transform((value) => optionalSanitizedHtml(value) ?? value),
  textContent: z.string().max(20000).nullable().optional(),
  variables: z.array(templateVariableSchema).optional(),
  isActive: z.boolean().optional(),
});

export const sendTestMailSchema = z.object({
  toEmail: z.string().email().max(200),
  templateKey: z.string().min(1).optional(),
});

export type UpdateMailSettingInput = z.infer<typeof updateMailSettingSchema>;
export type UpdateMailTemplateInput = z.infer<typeof updateMailTemplateSchema>;
export type SendTestMailInput = z.infer<typeof sendTestMailSchema>;
