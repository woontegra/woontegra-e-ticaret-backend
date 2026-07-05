import type { Request, Response } from 'express';
import { sendSuccess } from '../../lib/response.js';
import { listAuditLogsQuerySchema } from './audit.schema.js';
import * as auditService from './audit.service.js';

export async function listAuditLogs(req: Request, res: Response) {
  const query = listAuditLogsQuerySchema.parse(req.query);
  const data = await auditService.listAuditLogs(query);
  sendSuccess(res, data);
}

export async function getAuditModules(_req: Request, res: Response) {
  const data = await auditService.getAuditModules();
  sendSuccess(res, data);
}

export async function getAuditActions(_req: Request, res: Response) {
  const data = await auditService.getAuditActions();
  sendSuccess(res, data);
}
