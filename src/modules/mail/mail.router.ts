import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as mailController from './mail.controller.js';

export const mailSettingsAdminRouter = Router();
export const mailTemplatesAdminRouter = Router();
export const mailAdminRouter = Router();

const adminRoles = requireRoles('SUPER_ADMIN', 'ADMIN');

mailSettingsAdminRouter.use(requireAuth, adminRoles);
mailSettingsAdminRouter.get('/', asyncHandler(mailController.getMailSettings));
mailSettingsAdminRouter.put('/', asyncHandler(mailController.updateMailSettings));

mailTemplatesAdminRouter.use(requireAuth, adminRoles);
mailTemplatesAdminRouter.get('/', asyncHandler(mailController.listMailTemplates));
mailTemplatesAdminRouter.get(
  '/:id',
  asyncHandler(mailController.getMailTemplate),
);
mailTemplatesAdminRouter.put(
  '/:id',
  asyncHandler(mailController.updateMailTemplate),
);

mailAdminRouter.use(requireAuth, adminRoles);
mailAdminRouter.post('/test', asyncHandler(mailController.sendTestMail));
mailAdminRouter.get('/logs', asyncHandler(mailController.listMailLogs));
