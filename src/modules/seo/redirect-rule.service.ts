import { AppError } from '../../lib/app-error.js';
import { normalizePath, toRedirectRuleDto } from '../../lib/seo.mapper.js';
import { prisma } from '../../lib/prisma.js';
import type {
  CreateRedirectRuleInput,
  UpdateRedirectRuleInput,
} from './seo.schema.js';

export async function listRedirectRules() {
  const items = await prisma.redirectRule.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return items.map(toRedirectRuleDto);
}

export async function getRedirectRuleById(id: string) {
  const rule = await prisma.redirectRule.findUnique({ where: { id } });
  if (!rule) throw AppError.notFound('Redirect rule not found');
  return toRedirectRuleDto(rule);
}

export async function createRedirectRule(input: CreateRedirectRuleInput) {
  const sourcePath = normalizePath(input.sourcePath);
  const rule = await prisma.redirectRule.create({
    data: {
      sourcePath,
      targetPath: input.targetPath,
      statusCode: input.statusCode,
      isActive: input.isActive ?? true,
    },
  });
  return toRedirectRuleDto(rule);
}

export async function updateRedirectRule(
  id: string,
  input: UpdateRedirectRuleInput,
) {
  const existing = await prisma.redirectRule.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Redirect rule not found');

  const rule = await prisma.redirectRule.update({
    where: { id },
    data: {
      ...(input.sourcePath !== undefined
        ? { sourcePath: normalizePath(input.sourcePath) }
        : {}),
      ...(input.targetPath !== undefined ? { targetPath: input.targetPath } : {}),
      ...(input.statusCode !== undefined ? { statusCode: input.statusCode } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toRedirectRuleDto(rule);
}

export async function deleteRedirectRule(id: string) {
  const existing = await prisma.redirectRule.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Redirect rule not found');
  await prisma.redirectRule.delete({ where: { id } });
}

export async function findActiveRedirect(sourcePath: string) {
  const normalized = normalizePath(sourcePath);
  return prisma.redirectRule.findFirst({
    where: { sourcePath: normalized, isActive: true },
  });
}
