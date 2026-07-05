import type { Prisma } from '@prisma/client';
import { resolveReportDateRange } from '../../lib/date-range.js';
import { prisma } from '../../lib/prisma.js';
import type { ListAuditLogsQuery } from './audit.schema.js';

function toAuditLogDto(log: {
  id: string;
  userId: string | null;
  action: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  beforeData: unknown;
  afterData: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user?: { id: string; name: string; email: string } | null;
}) {
  return {
    id: log.id,
    userId: log.userId,
    userName: log.user?.name ?? null,
    userEmail: log.user?.email ?? null,
    action: log.action,
    module: log.module,
    entityType: log.entityType,
    entityId: log.entityId,
    beforeData: log.beforeData,
    afterData: log.afterData,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
  };
}

export async function listAuditLogs(query: ListAuditLogsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  let createdAt: Prisma.DateTimeFilter | undefined;
  if (query.dateFrom || query.dateTo) {
    const range = resolveReportDateRange(query.dateFrom, query.dateTo);
    createdAt = { gte: range.dateFrom, lte: range.dateTo };
  }

  const where: Prisma.AuditLogWhereInput = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.module ? { module: query.module } : {}),
    ...(query.action ? { action: query.action } : {}),
    ...(createdAt ? { createdAt } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: items.map(toAuditLogDto),
    total,
  };
}

export async function getAuditModules() {
  const rows = await prisma.auditLog.findMany({
    distinct: ['module'],
    select: { module: true },
    orderBy: { module: 'asc' },
  });

  return rows.map((row) => row.module);
}

export async function getAuditActions() {
  const rows = await prisma.auditLog.findMany({
    distinct: ['action'],
    select: { action: true },
    orderBy: { action: 'asc' },
  });

  return rows.map((row) => row.action);
}
