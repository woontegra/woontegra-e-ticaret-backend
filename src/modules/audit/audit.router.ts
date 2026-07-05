import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { ROLE_AUDIT_VIEWERS } from '../../lib/role-groups.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as auditController from './audit.controller.js';

export const auditAdminRouter = Router();

auditAdminRouter.use(requireAuth, requireRoles(...ROLE_AUDIT_VIEWERS));
auditAdminRouter.get('/', asyncHandler(auditController.listAuditLogs));
auditAdminRouter.get('/modules', asyncHandler(auditController.getAuditModules));
auditAdminRouter.get('/actions', asyncHandler(auditController.getAuditActions));
