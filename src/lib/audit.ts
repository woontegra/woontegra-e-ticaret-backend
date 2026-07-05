import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { toInputJson } from './json.js';
import { prisma } from './prisma.js';

export interface AuditEntry {
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
}

export interface AuditContext {
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function getAuditContext(req: Request): AuditContext {
  return {
    userId: req.user?.id ?? null,
    ipAddress: req.ip || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export async function recordAudit(
  context: AuditContext,
  entry: AuditEntry,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: context.userId ?? null,
      action: entry.action,
      module: entry.module,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      beforeData: entry.beforeData
        ? (toInputJson(entry.beforeData) as Prisma.InputJsonValue)
        : undefined,
      afterData: entry.afterData
        ? (toInputJson(entry.afterData) as Prisma.InputJsonValue)
        : undefined,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    },
  });
}

export function auditFromRequest(req: Request, entry: AuditEntry): void {
  void recordAudit(getAuditContext(req), entry).catch((error) => {
    console.error('[audit] record failed', error);
  });
}

export const AUDIT_ACTIONS = {
  USER_LOGIN: 'USER_LOGIN',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  PAGE_PUBLISH: 'PAGE_PUBLISH',
  PAGE_UNPUBLISH: 'PAGE_UNPUBLISH',
  BLOG_PUBLISH: 'BLOG_PUBLISH',
  BLOG_UNPUBLISH: 'BLOG_UNPUBLISH',
  THEME_UPDATE: 'THEME_UPDATE',
  HEADER_UPDATE: 'HEADER_UPDATE',
  SITE_SETTING_UPDATE: 'SITE_SETTING_UPDATE',
  COMPANY_SETTING_UPDATE: 'COMPANY_SETTING_UPDATE',
  ORDER_STATUS_UPDATE: 'ORDER_STATUS_UPDATE',
  MAIL_SETTING_UPDATE: 'MAIL_SETTING_UPDATE',
  PAYMENT_SETTING_UPDATE: 'PAYMENT_SETTING_UPDATE',
  SHIPPING_SETTING_UPDATE: 'SHIPPING_SETTING_UPDATE',
} as const;
