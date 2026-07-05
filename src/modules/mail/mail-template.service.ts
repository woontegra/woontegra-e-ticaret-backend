import type { Prisma } from '@prisma/client';
import { AppError } from '../../lib/app-error.js';
import { toMailTemplateDto } from '../../lib/mail.mapper.js';
import { prisma } from '../../lib/prisma.js';
import { defaultTemplateSeedData } from './default-templates.js';
import type { UpdateMailTemplateInput } from './mail.schema.js';

export async function ensureDefaultMailTemplates() {
  for (const template of defaultTemplateSeedData()) {
    await prisma.mailTemplate.upsert({
      where: { key: template.key },
      create: template,
      update: {},
    });
  }
}

export async function listMailTemplates() {
  await ensureDefaultMailTemplates();
  const templates = await prisma.mailTemplate.findMany({
    orderBy: { key: 'asc' },
  });
  return templates.map(toMailTemplateDto);
}

export async function getMailTemplateById(id: string) {
  await ensureDefaultMailTemplates();
  const template = await prisma.mailTemplate.findUnique({ where: { id } });
  if (!template) throw AppError.notFound('Mail template not found');
  return toMailTemplateDto(template);
}

export async function getMailTemplateByKey(key: string) {
  await ensureDefaultMailTemplates();
  return prisma.mailTemplate.findUnique({ where: { key } });
}

export async function updateMailTemplate(
  id: string,
  input: UpdateMailTemplateInput,
) {
  const existing = await prisma.mailTemplate.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Mail template not found');

  const variables = input.variables as Prisma.InputJsonValue | undefined;

  const template = await prisma.mailTemplate.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.subject !== undefined ? { subject: input.subject } : {}),
      ...(input.htmlContent !== undefined
        ? { htmlContent: input.htmlContent }
        : {}),
      ...(input.textContent !== undefined
        ? { textContent: input.textContent }
        : {}),
      ...(variables !== undefined ? { variables } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toMailTemplateDto(template);
}
